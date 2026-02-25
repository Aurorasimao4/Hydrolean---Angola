# AgroIntel API — Backend

Sistema Inteligente de Recomendação de Culturas e Irrigação Parametrizada.

## Arquitectura

```
Frontend (React) ──► FastAPI Backend
                         ├── /predict         → NaiveBayes (sklearn)
                         ├── /irrigar         → Gemini API (NLP)
                         ├── /analise-completa → predict + irrigar combinado
                         ├── /culturas        → Lista de culturas
                         └── /health          → Status da API
```

## Setup

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar Gemini API

```bash
cp .env.example .env
# Editar .env e colocar a GEMINI_API_KEY
```

Obter chave gratuita em: https://aistudio.google.com/apikey

### 3. Treinar modelo (se necessário)

```bash
python train_model.py
```

### 4. Iniciar servidor

```bash
python main.py
# ou
uvicorn main:app --reload --port 8000
```

### 5. Documentação interactiva

Aceder a: http://localhost:8000/docs (Swagger UI)

## Endpoints

### `POST /predict`
Prevê a cultura ideal com base nos parâmetros do solo.

```json
{
  "N": 90, "P": 42, "K": 43,
  "temperature": 20.87,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.93
}
```

### `POST /irrigar`
Gera recomendações de irrigação via Gemini.

```json
{
  "N": 90, "P": 42, "K": 43,
  "temperature": 20.87,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.93,
  "cultura": "Arroz",
  "area_hectares": 5.0,
  "tipo_solo": "argiloso",
  "sistema_irrigacao": "sulcos"
}
```

### `POST /analise-completa`
Combina previsão + irrigação num único request.

## Modelo

- **Algoritmo**: Gaussian Naive Bayes
- **Acurácia**: 99.55%
- **Culturas suportadas**: 22
- **Features**: N, P, K, temperatura, humidade, pH, precipitação
