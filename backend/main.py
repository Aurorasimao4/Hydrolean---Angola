"""
main.py — API de Recomendação de Culturas e Irrigação Inteligente
FastAPI + NaiveBayes + Open-Meteo (Meteo) + DeepSeek (NLP)

Endpoints:
  POST /predict          → Prevê a cultura ideal com base nos parâmetros do solo
  POST /irrigar          → Recomendações de irrigação via DeepSeek (solo + meteo)
  POST /analise-completa → predict + irrigar combinado
  GET  /meteo            → Previsão meteorológica para uma localização
  GET  /health           → Health check
  POST /chat             → Chatbot AgroIntel com contexto real da fazenda
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import joblib
import numpy as np
import os
import httpx
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv

# Database & Auth
from sqlalchemy.orm import Session
from fastapi import Depends
from database import engine, Base, get_db
from auth import router as auth_router, get_current_user
from models import Fazenda, Usuario, SensorZone

# ============================================================
# NOVO SDK — OpenAI (Para DeepSeek)
# pip install openai
# ============================================================
from openai import AsyncOpenAI
import os
from fastapi.staticfiles import StaticFiles

load_dotenv()

# ============================================================
# CONFIGURAÇÃO
# ============================================================

# Caminho base = pasta onde o main.py está (funciona em qualquer SO)
BASE_DIR = Path(__file__).resolve().parent

# Cria tabelas se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgroIntel API",
    description="Sistema Inteligente de Recomendação de Culturas e Irrigação Parametrizada",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos de uploads estaticamente (logos, etc)
os.makedirs("uploads/logos", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Adicionar rotas de Auth
app.include_router(auth_router)

# ============================================================
# PERSISTÊNCIA DO MAPA (FAZENDA & SENSORES)
# ============================================================

class PolygonUpdateRequest(BaseModel):
    polygon: str

class ZoneCreate(BaseModel):
    name: str
    lat: float
    lng: float
    type: str = "sensor"
    status: str = "optimal"
    # Campos que seriam preenchidos por hardware/backend no mundo real, mas enviamos do frontend no MVP
    crop: Optional[str] = "Não definido"
    moisture: Optional[int] = 50
    temp: Optional[int] = 25
    rainForecast: Optional[str] = "Sem dados"
    battery: Optional[int] = 100
    signal: Optional[str] = "ND"
    lastUpdate: Optional[str] = "Agora"
    aiMode: Optional[bool] = False
    pumpOn: Optional[bool] = False

@app.put("/fazenda/polygon")
async def update_polygon(
    data: PolygonUpdateRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fazenda = db.query(Fazenda).filter(Fazenda.id == current_user.fazenda_id).first()
    if not fazenda:
        # Se não existe, cria a fazenda para este utilizador
        fazenda = Fazenda(
            id=current_user.fazenda_id,
            nome="Fazenda",
            nif="000000000",
            endereco="",
            logo_url=None,
            polygon_coordinates=None
        )
        db.add(fazenda)
        db.flush()  # Garante ID sem commit final
    
    fazenda.polygon_coordinates = data.polygon
    db.commit()
    return {"message": "Polígono da fazenda atualizado com sucesso"}

@app.get("/fazenda/zones")
async def get_zones(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    zones = db.query(SensorZone).filter(SensorZone.fazenda_id == current_user.fazenda_id).all()
    return zones

@app.post("/fazenda/zones")
async def create_zone(
    zone: ZoneCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    nova_zone = SensorZone(
        fazenda_id=current_user.fazenda_id,
        name=zone.name,
        lat=zone.lat,
        lng=zone.lng,
        type=zone.type,
        status=zone.status,
        crop=zone.crop,
        moisture=zone.moisture,
        temp=zone.temp,
        rainForecast=zone.rainForecast,
        battery=zone.battery,
        signal=zone.signal,
        lastUpdate=zone.lastUpdate,
        aiMode=zone.aiMode,
        pumpOn=zone.pumpOn
    )
    db.add(nova_zone)
    db.commit()
    db.refresh(nova_zone)
    return nova_zone

@app.put("/fazenda/zones/{zone_id}")
async def update_zone(
    zone_id: int,
    zone_data: ZoneCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    zone = db.query(SensorZone).filter(SensorZone.id == zone_id, SensorZone.fazenda_id == current_user.fazenda_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zona/Sensor não encontrad(o)a.")
    
    zone.name = zone_data.name
    zone.lat = zone_data.lat
    zone.lng = zone_data.lng
    zone.type = zone_data.type
    zone.status = zone_data.status
    zone.crop = zone_data.crop
    zone.moisture = zone_data.moisture
    zone.temp = zone_data.temp
    zone.rainForecast = zone_data.rainForecast
    zone.battery = zone_data.battery
    zone.signal = zone_data.signal
    zone.lastUpdate = zone_data.lastUpdate
    zone.aiMode = zone_data.aiMode
    zone.pumpOn = zone_data.pumpOn

    db.commit()
    db.refresh(zone)
    return zone

@app.delete("/fazenda/zones/{zone_id}")
async def delete_zone(
    zone_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    zone = db.query(SensorZone).filter(SensorZone.id == zone_id, SensorZone.fazenda_id == current_user.fazenda_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zona/Sensor não encontrad(o)a.")
    
    db.delete(zone)
    db.commit()
    return {"message": "Sensor removido com sucesso"}

# Carregar modelo e labels (caminho relativo ao main.py)
MODEL_PATH = BASE_DIR / "models" / "NAIVEBAYES.pkl"
#LABELS_PATH = BASE_DIR / "models" / "culturas_labels.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Modelo não encontrado em: {MODEL_PATH}\n"
        f"Certifica-te que a pasta 'models/' está ao lado do main.py.\n"
        f"Estrutura esperada:\n"
        f"  {BASE_DIR}/\n"
        f"    main.py\n"
        f"    models/\n"
        f"      NAIVEBAYES.pkl\n"
        f"      culturas_labels.pkl"
    )

modelo = joblib.load(MODEL_PATH)
#culturas_labels = joblib.load(LABELS_PATH)

# Configurar DeepSeek (via OpenAI SDK)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
ai_client = None
if DEEPSEEK_API_KEY:
    ai_client = AsyncOpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

# Mapeamento de culturas para português
CULTURAS_PT = {
    "rice": "Arroz",
    "maize": "Milho",
    "chickpea": "Grão-de-bico",
    "kidneybeans": "Feijão-vermelho",
    "pigeonpeas": "Feijão-guandu",
    "mothbeans": "Feijão-moth",
    "mungbean": "Feijão-mungo",
    "blackgram": "Feijão-preto",
    "lentil": "Lentilha",
    "pomegranate": "Romã",
    "banana": "Banana",
    "mango": "Manga",
    "grapes": "Uva",
    "watermelon": "Melancia",
    "muskmelon": "Melão",
    "apple": "Maçã",
    "orange": "Laranja",
    "papaya": "Papaia",
    "coconut": "Coco",
    "cotton": "Algodão",
    "jute": "Juta",
    "coffee": "Café",
}

# ============================================================
# FUNÇÃO AUXILIAR — Chamar DeepSeek
# ============================================================

async def chamar_deepseek(system_prompt: str, user_prompt: str, max_tokens: int = 2000) -> str:
    """Chama a API do DeepSeek via OpenAI SDK de forma assíncrona."""
    if not ai_client:
        raise HTTPException(
            status_code=503,
            detail="DeepSeek não configurado. Defina DEEPSEEK_API_KEY no .env",
        )
    try:
        response = await ai_client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro DeepSeek: {str(e)}")


# ============================================================
# OPEN-METEO — PREVISÃO METEOROLÓGICA (GRATUITA, SEM API KEY)
# ============================================================

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def obter_previsao_meteo(latitude: float, longitude: float) -> dict:
    """
    Busca previsão meteorológica de 48h via Open-Meteo.

    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation_probability",
            "precipitation",
            "rain",
            "evapotranspiration",
            "wind_speed_10m",
            "soil_moisture_0_to_1cm",
            "soil_moisture_1_to_3cm",
        ]),
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "rain_sum",
            "et0_fao_evapotranspiration",
        ]),
        "timezone": "auto",
        "forecast_days": 3,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        data = response.json()

    # Processar dados horários
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    precip_prob = hourly.get("precipitation_probability", [])
    precip_mm = hourly.get("precipitation", [])
    rain_mm = hourly.get("rain", [])
    temp = hourly.get("temperature_2m", [])
    humidity = hourly.get("relative_humidity_2m", [])
    evapotranspiration = hourly.get("evapotranspiration", [])
    wind = hourly.get("wind_speed_10m", [])
    soil_moisture_0_1 = hourly.get("soil_moisture_0_to_1cm", [])
    soil_moisture_1_3 = hourly.get("soil_moisture_1_to_3cm", [])

    # Próxima chuva significativa (>= 1mm)
    proxima_chuva = None
    for i, (t, p, prob) in enumerate(zip(times, precip_mm, precip_prob)):
        if p and p >= 1.0:
            proxima_chuva = {
                "quando": t,
                "horas_ate_chuva": i,
                "precipitacao_mm": p,
                "probabilidade": prob,
            }
            break

    # Totais de chuva por janela
    chuva_6h = sum(r for r in rain_mm[:6] if r) if rain_mm else 0
    chuva_12h = sum(r for r in rain_mm[:12] if r) if rain_mm else 0
    chuva_24h = sum(r for r in rain_mm[:24] if r) if rain_mm else 0
    chuva_48h = sum(r for r in rain_mm[:48] if r) if rain_mm else 0

    et_24h = sum(e for e in evapotranspiration[:24] if e) if evapotranspiration else 0

    daily = data.get("daily", {})

    # Decisão rápida
    irrigar_agora = True
    motivo = "Sem previsão de chuva significativa — irrigação recomendada."

    if proxima_chuva and proxima_chuva["horas_ate_chuva"] <= 6:
        irrigar_agora = False
        h = proxima_chuva["horas_ate_chuva"]
        mm = proxima_chuva["precipitacao_mm"]
        motivo = f"Chuva prevista em ~{h}h ({mm:.1f}mm) — adiar irrigação."
    elif chuva_24h >= 10:
        irrigar_agora = False
        motivo = f"Previsão de {chuva_24h:.1f}mm nas próximas 24h — irrigação desnecessária."
    elif chuva_24h >= 5:
        motivo = f"Chuva moderada prevista ({chuva_24h:.1f}mm/24h) — reduzir volume de irrigação."

    return {
        "localizacao": {
            "latitude": latitude,
            "longitude": longitude,
            "timezone": data.get("timezone", "UTC"),
        },
        "previsao_horaria_resumo": {
            "proximas_6h": {
                "chuva_total_mm": round(chuva_6h, 2),
                "temp_media": round(np.mean([t for t in temp[:6] if t is not None]), 1) if temp[:6] else None,
                "humidade_media": round(np.mean([h for h in humidity[:6] if h is not None]), 1) if humidity[:6] else None,
            },
            "proximas_12h": {
                "chuva_total_mm": round(chuva_12h, 2),
            },
            "proximas_24h": {
                "chuva_total_mm": round(chuva_24h, 2),
                "evapotranspiracao_mm": round(et_24h, 2),
                "balanco_hidrico_mm": round(chuva_24h - et_24h, 2),
            },
            "proximas_48h": {
                "chuva_total_mm": round(chuva_48h, 2),
            },
        },
        "proxima_chuva": proxima_chuva,
        "humidade_solo": {
            "superficial_0_1cm": soil_moisture_0_1[0] if soil_moisture_0_1 else None,
            "profunda_1_3cm": soil_moisture_1_3[0] if soil_moisture_1_3 else None,
        },
        "previsao_diaria": {
            "dias": daily.get("time", []),
            "temp_max": daily.get("temperature_2m_max", []),
            "temp_min": daily.get("temperature_2m_min", []),
            "precipitacao_total": daily.get("precipitation_sum", []),
            "prob_precipitacao_max": daily.get("precipitation_probability_max", []),
            "chuva_total": daily.get("rain_sum", []),
            "et0_fao": daily.get("et0_fao_evapotranspiration", []),
        },
        "decisao_rapida": {
            "irrigar_agora": irrigar_agora,
            "motivo": motivo,
        },
        "vento_atual_kmh": wind[0] if wind else None,
    }


# ============================================================
# SCHEMAS
# ============================================================

class SoloParametros(BaseModel):
    N: float = Field(..., description="Nitrogénio (mg/kg)", ge=0, le=200)
    P: float = Field(..., description="Fósforo (mg/kg)", ge=0, le=200)
    K: float = Field(..., description="Potássio (mg/kg)", ge=0, le=300)
    temperature: float = Field(..., description="Temperatura (°C)", ge=0, le=60)
    humidity: float = Field(..., description="Humidade relativa (%)", ge=0, le=100)
    ph: float = Field(..., description="pH do solo", ge=0, le=14)
    rainfall: float = Field(..., description="Precipitação (mm)", ge=0, le=500)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "N": 90, "P": 42, "K": 43,
                    "temperature": 20.87, "humidity": 82.0,
                    "ph": 6.5, "rainfall": 202.93,
                }
            ]
        }
    }


class IrrigacaoRequest(BaseModel):
    N: float = Field(..., ge=0, le=200)
    P: float = Field(..., ge=0, le=200)
    K: float = Field(..., ge=0, le=300)
    temperature: float = Field(..., ge=0, le=60)
    humidity: float = Field(..., ge=0, le=100)
    ph: float = Field(..., ge=0, le=14)
    rainfall: float = Field(..., ge=0, le=500)
    latitude: float = Field(..., description="Latitude da plantação", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude da plantação", ge=-180, le=180)
    cultura: Optional[str] = Field(None, description="Cultura prevista (se não enviada, prevê automaticamente)")
    area_hectares: Optional[float] = Field(None, description="Área da plantação em hectares")
    tipo_solo: Optional[str] = Field(None, description="Tipo de solo (ex: argiloso, arenoso, laterítico)")
    sistema_irrigacao: Optional[str] = Field(None, description="Sistema de irrigação actual")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "N": 90, "P": 42, "K": 43,
                    "temperature": 20.87, "humidity": 82.0,
                    "ph": 6.5, "rainfall": 202.93,
                    "latitude": -8.838, "longitude": 13.234,
                    "tipo_solo": "argiloso", "area_hectares": 5.0,
                }
            ]
        }
    }


class PrevisaoResponse(BaseModel):
    cultura_en: str
    cultura_pt: str
    confianca: float
    probabilidades: dict[str, float]


class IrrigacaoResponse(BaseModel):
    cultura_recomendada: str
    decisao_rapida: dict
    previsao_meteo: dict
    recomendacao_irrigacao: str
    parametros_analisados: dict


class AnaliseCompletaResponse(BaseModel):
    previsao: PrevisaoResponse
    irrigacao: IrrigacaoResponse


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "versao": "2.0.0 — com dados meteorológicos",
        "modelo": "NaiveBayes (GaussianNB)",
        #"culturas_suportadas": len(culturas_labels),
        "deepseek_configurado": ai_client is not None,
        "meteo_provider": "Open-Meteo (gratuito, sem API key)",
    }

'''
@app.get("/culturas")
async def listar_culturas():
    return {
      #  "total": len(culturas_labels),
       # "culturas": [{"en": c, "pt": CULTURAS_PT.get(c, c)} for c in culturas_labels],
    }  '''


@app.get("/meteo")
async def previsao_meteorologica(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    """Retorna previsão meteorológica de 48h para uma localização."""
    try:
        meteo = await obter_previsao_meteo(latitude, longitude)
        return meteo
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Erro ao buscar dados meteorológicos: {str(e)}")


@app.post("/predict", response_model=PrevisaoResponse)
async def prever_cultura(params: SoloParametros):
    """Prevê a cultura ideal com base nos parâmetros do solo."""
    try:
        features = np.array(
            [[params.N, params.P, params.K, params.temperature,
              params.humidity, params.ph, params.rainfall]]
        )
        previsao = modelo.predict(features)[0]
        probas = modelo.predict_proba(features)[0]
        confianca = float(np.max(probas))

        indices_top = np.argsort(probas)[::-1][:5]
        probabilidades = {
            CULTURAS_PT.get(modelo.classes_[i], modelo.classes_[i]): round(float(probas[i]) * 100, 2)
            for i in indices_top
        }

        return PrevisaoResponse(
            cultura_en=previsao,
            cultura_pt=CULTURAS_PT.get(previsao, previsao),
            confianca=round(confianca * 100, 2),
            probabilidades=probabilidades,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na previsão: {str(e)}")


@app.post("/irrigar", response_model=IrrigacaoResponse)
async def recomendar_irrigacao(params: IrrigacaoRequest):
    """
    Recomendações de irrigação combinando:
    1. Dados do solo
    2. Previsão meteorológica em tempo real (Open-Meteo)
    3. Análise inteligente via DeepSeek (NLP)
    """
    if not ai_client:
        raise HTTPException(
            status_code=503,
            detail="DeepSeek API não configurada. Defina DEEPSEEK_API_KEY no .env",
        )

    # 1. Buscar previsão meteorológica
    try:
        meteo = await obter_previsao_meteo(params.latitude, params.longitude)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Erro ao buscar meteo: {str(e)}")

    # 2. Prever cultura se não fornecida
    cultura = params.cultura
    if not cultura:
        features = np.array(
            [[params.N, params.P, params.K, params.temperature,
              params.humidity, params.ph, params.rainfall]]
        )
        cultura_en = modelo.predict(features)[0]
        cultura = CULTURAS_PT.get(cultura_en, cultura_en)

    # 3. Extrair resumo meteo
    decisao = meteo["decisao_rapida"]
    resumo_meteo = meteo["previsao_horaria_resumo"]
    prox_chuva = meteo["proxima_chuva"]
    solo_humidade = meteo["humidade_solo"]
    diario = meteo["previsao_diaria"]

    # 4. Prompt para o DeepSeek
    system_prompt = """Você é um engenheiro agrónomo especialista em irrigação e agricultura tropical,
especialmente nos contextos de Angola, Moçambique e Brasil.
Responda SEMPRE em português de forma clara e prática. Não és permitido falar sobre o tipo de cultura."""

    user_prompt = f"""O agricultor quer saber: DEVO IRRIGAR AGORA? QUANTO? COMO? QUE CULTURA PLANTAR?

DADOS DO SOLO:
- Nitrogénio (N): {params.N} mg/kg
- Fósforo (P): {params.P} mg/kg
- Potássio (K): {params.K} mg/kg
- Temperatura do solo: {params.temperature}°C
- Humidade relativa: {params.humidity}%
- pH do solo: {params.ph}
- Precipitação histórica: {params.rainfall} mm
{f"- Tipo de solo: {params.tipo_solo}" if params.tipo_solo else ""}
{f"- Área: {params.area_hectares} hectares" if params.area_hectares else ""}
{f"- Sistema de irrigação: {params.sistema_irrigacao}" if params.sistema_irrigacao else ""}

CULTURA RECOMENDADA: {cultura}
MUITO IMPORTANTEA Cultura dependerá do solo e do modelo de IA treinado.
PREVISÃO METEOROLÓGICA (TEMPO REAL):
Localização: {params.latitude}, {params.longitude}

Próximas 6h:
  - Chuva prevista: {resumo_meteo['proximas_6h']['chuva_total_mm']} mm
  - Temperatura média: {resumo_meteo['proximas_6h']['temp_media']}°C
  - Humidade média: {resumo_meteo['proximas_6h']['humidade_media']}%

Próximas 24h:
  - Chuva prevista: {resumo_meteo['proximas_24h']['chuva_total_mm']} mm
  - Evapotranspiração: {resumo_meteo['proximas_24h']['evapotranspiracao_mm']} mm
  - Balanço hídrico: {resumo_meteo['proximas_24h']['balanco_hidrico_mm']} mm

Próximas 48h:
  - Chuva total prevista: {resumo_meteo['proximas_48h']['chuva_total_mm']} mm

Próxima chuva significativa (>=1mm):
  {f"Em ~{prox_chuva['horas_ate_chuva']}h — {prox_chuva['precipitacao_mm']}mm (probabilidade: {prox_chuva['probabilidade']}%)" if prox_chuva else "Sem previsão de chuva significativa nas próximas 48h"}

Humidade do solo (satélite):
  - Superficial (0-1cm): {solo_humidade['superficial_0_1cm']}
  - Profunda (1-3cm): {solo_humidade['profunda_1_3cm']}

Vento actual: {meteo['vento_atual_kmh']} km/h

Previsão diária (3 dias):
{chr(10).join(f"  {diario['dias'][i]}: {diario['temp_min'][i]}–{diario['temp_max'][i]}°C, chuva: {diario['precipitacao_total'][i]}mm, ET0: {diario['et0_fao'][i]}mm" for i in range(len(diario['dias'])))}

RESPONDA NESTA ESTRUTURA:

## DECISÃO IMEDIATA
Irrigar agora: SIM ou NÃO (e porquê, considerando a previsão meteo)

## PLANO DE IRRIGAÇÃO
- Volume recomendado: litros/planta/dia ou mm/semana
- Frequência: de quantos em quantos dias
- Melhor horário: considerando temperatura e evapotranspiração
- Ajuste pela chuva prevista

## MÉTODO RECOMENDADO
Qual sistema de irrigação usar e porquê
{f"Avaliação do sistema actual ({params.sistema_irrigacao})" if params.sistema_irrigacao else ""}

## ANÁLISE DO SOLO
Avaliação rápida dos nutrientes (N, P, K) e pH para esta cultura

## ALERTAS
Riscos de sobre-irrigação, sub-irrigação, ou condições meteo adversas

## DICAS PRÁTICAS
2-3 recomendações concretas que o agricultor pode aplicar hoje

=== REGRAS DE RESPOSTA E ESTRUTURA ===
- Responde em TEXTO SIMPLES. NÃO utilizes formatação Markdown (nem asteriscos `**`, nem hashes `#`). Usa quebras de linha normais, espaços e travessões `-` para estruturar a resposta de forma limpa.
- Se o utilizador perguntar "Que cultura devo plantar?" (ou similar) e os sensores não tiverem a cultura definida, NÃO dês uma recusa genérica.
- Em vez disso, assume a postura de um consultor técnico. Explica que o nosso Modelo de Inteligência Artificial precisa de parâmetros específicos da análise de solo para recomendar a cultura ideal com precisão.
- Solicita de forma clara os seguintes dados exatos para alimentar o modelo preditivo:
  * Níveis de Nitrogénio (N), Fósforo (P) e Potássio (K) em mg/kg
  * pH do solo
  * Nível de precipitação histórica (mm)
- Mantém um tom direto, focado na solução e sem rodeios. Não faças perguntas vagas sobre o objetivo do agricultor; foca-te nos dados técnicos.


Seja DIRECTO e PRÁTICO."""

    # 5. Chamar DeepSeek
    resposta_texto = await chamar_deepseek(system_prompt, user_prompt)


    # 6. Montar resposta
    parametros_analisados = {
        "solo": {
            "N": params.N, "P": params.P, "K": params.K,
            "temperatura": params.temperature,
            "humidade": params.humidity,
            "ph": params.ph, "precipitacao_historica": params.rainfall,
        },
        "localizacao": {
            "latitude": params.latitude, "longitude": params.longitude,
        },
        "meteo_consultado_em": datetime.now(timezone.utc).isoformat(),
    }
    if params.area_hectares:
        parametros_analisados["area_hectares"] = params.area_hectares
    if params.tipo_solo:
        parametros_analisados["tipo_solo"] = params.tipo_solo
    if params.sistema_irrigacao:
        parametros_analisados["sistema_irrigacao"] = params.sistema_irrigacao

    return IrrigacaoResponse(
        cultura_recomendada=cultura,
        decisao_rapida=decisao,
        previsao_meteo=resumo_meteo,
        recomendacao_irrigacao=resposta_texto,
        parametros_analisados=parametros_analisados,
    )


@app.post("/analise-completa", response_model=AnaliseCompletaResponse)
async def analise_completa(params: IrrigacaoRequest):
    """Endpoint combinado: previsão da cultura + irrigação com meteo."""
    solo = SoloParametros(
        N=params.N, P=params.P, K=params.K,
        temperature=params.temperature,
        humidity=params.humidity,
        ph=params.ph, rainfall=params.rainfall,
    )
    previsao = await prever_cultura(solo)

    params.cultura = previsao.cultura_pt
    irrigacao = await recomendar_irrigacao(params)

    return AnaliseCompletaResponse(
        previsao=previsao,
        irrigacao=irrigacao,
    )


# ============================================================
# CHATBOT AGROÍNTEL — /chat
# ============================================================

class ChatMessageItem(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    mensagem: str
    historico: List[ChatMessageItem] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None


@app.post("/chat")
async def chat_agroíntel(
    body: ChatRequest,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chatbot AgroIntel com contexto real da fazenda.
    Carrega sensores, polígono e dados meteo e responde via DeepSeek.
    """
    if not ai_client:
        raise HTTPException(
            status_code=503,
            detail="DeepSeek API não configurada. Defina DEEPSEEK_API_KEY no .env"
        )

    # 1. Carregar dados da fazenda do utilizador
    fazenda = db.query(Fazenda).filter(Fazenda.id == current_user.fazenda_id).first()
    zones = db.query(SensorZone).filter(SensorZone.fazenda_id == current_user.fazenda_id).all()

    # 2. Construir resumo dos sensores e calcular previsões por sensor
    sensores_txt = ""
    if zones:
        linhas = []
        for z in zones:
            status_map = {
                "optimal": "✅ Ótimo", "attention": "⚠️ Atenção",
                "critical": "🚨 Crítico", "irrigating": "💧 Irrigando"
            }
            tipo = z.type.capitalize()
            
            # Usar dados simulados sensatos para o ML quando não há sensores reais completos
            # Idealmente estes seriam dados reais medidos pelo sensor
            temp_solo = z.temp if z.temp else 25.0
            hum_solo = z.moisture if z.moisture else 60.0
            
            # Valores proxy padrão para demonstração
            N_proxy = 60.0
            P_proxy = 45.0
            K_proxy = 40.0
            ph_proxy = 6.5
            chuva_proxy = 100.0 # Aproximação baseada em histórico de precipitação
            
            # Calcular a predição através do modelo para esta zona
            try:
                features = np.array([[N_proxy, P_proxy, K_proxy, temp_solo, hum_solo, ph_proxy, chuva_proxy]])
                cultura_en = modelo.predict(features)[0]
                cultura_ml_prevista = CULTURAS_PT.get(cultura_en, cultura_en)
            except:
                cultura_ml_prevista = "Indisponível"

            linhas.append(
                f"  - [{tipo}] {z.name}: humidade={z.moisture}%, temp={z.temp}°C, "
                f"cultura atual={z.crop or 'N/D'}, status={status_map.get(z.status, z.status)}, "
                f"bomba={'LIGADA' if z.pumpOn else 'desligada'}, "
                f"bateria={z.battery}%, sinal={z.signal}, "
                f"chuva_prevista={z.rainForecast or 'N/D'}, "
                f"IA={'ativa' if z.aiMode else 'inativa'}, "
                f"Cultura Recomendada (via ML)={cultura_ml_prevista}"
            )
        sensores_txt = "\n".join(linhas)
    else:
        sensores_txt = "  Nenhum sensor registado ainda."

    # 3. Dados da fazenda
    fazenda_nome = fazenda.nome if fazenda else "Fazenda"
    area_definida = "Sim" if (fazenda and fazenda.polygon_coordinates and fazenda.polygon_coordinates != "[]") else "Não"

    # 4. Obter dados meteorológicos (se localização disponível)
    meteo_txt = "Dados meteorológicos não disponíveis (sem localização)."
    if body.latitude and body.longitude:
        try:
            meteo = await obter_previsao_meteo(body.latitude, body.longitude)
            dec = meteo.get("decisao_rapida", {})
            resumo = meteo.get("previsao_horaria_resumo", {})
            prox6h = resumo.get("proximas_6h", {})
            prox24h = resumo.get("proximas_24h", {})
            meteo_txt = (
                f"  Temp. atual: {prox6h.get('temp_media', 'N/D')}°C | "
                f"Humidade ar: {prox6h.get('humidade_media', 'N/D')}% | "
                f"Chuva 24h: {prox24h.get('chuva_total_mm', 0)}mm | "
                f"Decisão: {dec.get('motivo', 'N/D')}"
            )
        except Exception:
            meteo_txt = "Erro ao obter dados meteorológicos."

    # 5. System prompt com contexto completo
    system_prompt = f"""És o AgroIntel, assistente agrícola inteligente do HydroSync.
Respondes SEMPRE em português (pt-PT ou pt-BR), de forma clara, direta e amigável.
Tens acesso em tempo real aos dados da fazenda do utilizador. Usa SEMPRE esses dados para personalizar as respostas.
Se perguntarem sobre sensores, solo, irrigação ou culturas, baseia a resposta nos dados abaixo.

=== CONTEXTO DA FAZENDA ===
Nome: {fazenda_nome}
Utilizador: {current_user.nome} ({current_user.email})
Área mapeada: {area_definida}
Total de sensores/equipamentos: {len(zones)}

=== ESTADO DOS SENSORES ===
{sensores_txt}

=== DADOS METEOROLÓGICOS ===
{meteo_txt}

=== REGRAS DE RESPOSTA ===
- Sê conciso mas informativo (máx. 4 parágrafos)
- Escreve em TEXTO SIMPLES. NÃO utilizes nenhuma formatação Markdown (como ** ou #).
- Quando há dados de sensores, cita-os explicitamente (ex: "O sensor Zona A tem 32% de humidade...")
- Para alertas críticos, usa emojis relevantes
- Se o utilizador perguntar que cultura plantar, usa as "Culturas Recomendadas (via ML)" presentes no ESTADO DOS SENSORES para fundamentar a tua resposta sem pedir mais dados ao utilizador.
- Se não tiveres dados suficientes, diz honestamente e sugere ações
- Responde sempre em português"""

    # 6. Construir histórico para DeepSeek
    messages_to_send = [{"role": "system", "content": system_prompt}]
    for msg in body.historico:
        messages_to_send.append({"role": msg.role, "content": msg.content})
    messages_to_send.append({"role": "user", "content": body.mensagem})

    # 7. Chamar DeepSeek
    try:
        response = await ai_client.chat.completions.create(
            model="deepseek-chat",
            messages=messages_to_send,
            stream=False,
            max_tokens=800,
            temperature=0.7,
        )
        resposta = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar DeepSeek: {str(e)}")

    # 8. Retornar resposta e histórico actualizado
    historico_atualizado = list(body.historico) + [
        {"role": "user", "content": body.mensagem},
        {"role": "assistant", "content": resposta},
    ]

    return {
        "resposta": resposta,
        "historico_atualizado": historico_atualizado,
    }


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)