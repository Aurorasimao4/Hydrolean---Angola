"""
migrate_to_postgres.py — Migração de dados SQLite → PostgreSQL (Render)
===========================================================================
Como usar:
  1. Instala psycopg2:  pip install psycopg2-binary
  2. Define a variável de ambiente com a URL do PostgreSQL do Render:
     $env:DATABASE_URL = "postgresql://hydrosync_db_user:FXLs33jIjo4K0fJ49n6BM1FGH3qE2FUt@dpg-d6fm6updrdic73bdf6t0-a.frankfurt-postgres.render.com/hydrosync_db"
  3. Corre o script:    python migrate_to_postgres.py
"""

import sqlite3
import os
import sys

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("❌ psycopg2 não instalado. Corre: pip install psycopg2-binary")
    sys.exit(1)

# ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "hydrolean2.db")

# URL EXTERNA do PostgreSQL do Render (usa a External Database URL, não a Internal)
POSTGRES_URL = os.getenv(
    "DATABASE_URL",
    # Fallback — substitui pela tua External URL do dashboard do Render > hydrosync-db > Connect > External
    "postgresql://hydrosync_db_user:FXLs33jIjo4K0fJ49n6BM1FGH3qE2FUt@dpg-d6fm6updrdic73bdf6t0-a.frankfurt-postgres.render.com/hydrosync_db"
)

# Render usa "postgres://" mas psycopg2 precisa de "postgresql://"
if POSTGRES_URL.startswith("postgres://"):
    POSTGRES_URL = POSTGRES_URL.replace("postgres://", "postgresql://", 1)

# ─── LIGAÇÕES ────────────────────────────────────────────────────────────────

print(f"🗄️  SQLite: {SQLITE_PATH}")
print(f"🐘 PostgreSQL: {POSTGRES_URL[:50]}...")
print()

if not os.path.exists(SQLITE_PATH):
    print(f"❌ SQLite não encontrado em: {SQLITE_PATH}")
    sys.exit(1)

sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row

try:
    pg_conn = psycopg2.connect(POSTGRES_URL)
    pg_conn.autocommit = False
    pg_cursor = pg_conn.cursor()
    print("✅ Ligação ao PostgreSQL estabelecida")
except Exception as e:
    print(f"❌ Erro ao ligar ao PostgreSQL: {e}")
    sys.exit(1)

# ─── CRIAR TABELAS (se não existirem) ────────────────────────────────────────

print("\n📋 A criar tabelas no PostgreSQL...")

pg_cursor.execute("""
CREATE TABLE IF NOT EXISTS fazendas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    nif VARCHAR UNIQUE NOT NULL,
    endereco VARCHAR,
    logo_url VARCHAR,
    polygon_coordinates TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
""")

pg_cursor.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    senha_hash VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    fazenda_id INTEGER NOT NULL REFERENCES fazendas(id) ON DELETE CASCADE
);
""")

pg_cursor.execute("""
CREATE TABLE IF NOT EXISTS sensor_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    type VARCHAR DEFAULT 'sensor',
    status VARCHAR DEFAULT 'optimal',
    crop VARCHAR,
    moisture INTEGER DEFAULT 50,
    temp INTEGER DEFAULT 25,
    "rainForecast" VARCHAR DEFAULT 'Sem chuva',
    battery INTEGER DEFAULT 100,
    signal VARCHAR DEFAULT '4G',
    "lastUpdate" VARCHAR DEFAULT 'Agora',
    "aiMode" BOOLEAN DEFAULT FALSE,
    "pumpOn" BOOLEAN DEFAULT FALSE,
    level INTEGER,
    fazenda_id INTEGER NOT NULL REFERENCES fazendas(id) ON DELETE CASCADE
);
""")

pg_conn.commit()
print("✅ Tabelas criadas/verificadas")

# ─── MIGRAR FAZENDAS ─────────────────────────────────────────────────────────

print("\n🌾 A migrar fazendas...")
sqlite_cursor = sqlite_conn.execute("SELECT * FROM fazendas")
fazendas = sqlite_cursor.fetchall()

if fazendas:
    for f in fazendas:
        pg_cursor.execute("""
            INSERT INTO fazendas (id, nome, nif, endereco, logo_url, polygon_coordinates, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nome = EXCLUDED.nome,
                nif = EXCLUDED.nif,
                endereco = EXCLUDED.endereco,
                logo_url = EXCLUDED.logo_url,
                polygon_coordinates = EXCLUDED.polygon_coordinates
        """, (f["id"], f["nome"], f["nif"], f["endereco"], f["logo_url"],
              f["polygon_coordinates"], f["created_at"]))
    print(f"  ✅ {len(fazendas)} fazenda(s) migrada(s)")

    # Actualizar o SERIAL para continuar após os IDs existentes
    pg_cursor.execute("SELECT setval('fazendas_id_seq', (SELECT MAX(id) FROM fazendas))")
else:
    print("  ⚠️  Nenhuma fazenda encontrada no SQLite")

# ─── MIGRAR UTILIZADORES ─────────────────────────────────────────────────────

print("\n👤 A migrar utilizadores...")
sqlite_cursor = sqlite_conn.execute("SELECT * FROM usuarios")
usuarios = sqlite_cursor.fetchall()

if usuarios:
    for u in usuarios:
        pg_cursor.execute("""
            INSERT INTO usuarios (id, nome, email, senha_hash, role, created_at, fazenda_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nome = EXCLUDED.nome,
                email = EXCLUDED.email,
                senha_hash = EXCLUDED.senha_hash,
                role = EXCLUDED.role,
                fazenda_id = EXCLUDED.fazenda_id
        """, (u["id"], u["nome"], u["email"], u["senha_hash"],
              u["role"], u["created_at"], u["fazenda_id"]))
    print(f"  ✅ {len(usuarios)} utilizador(es) migrado(s)")

    pg_cursor.execute("SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios))")
else:
    print("  ⚠️  Nenhum utilizador encontrado no SQLite")

# ─── MIGRAR SENSOR ZONES ─────────────────────────────────────────────────────

print("\n📡 A migrar sensor zones...")
sqlite_cursor = sqlite_conn.execute("SELECT * FROM sensor_zones")
zones = sqlite_cursor.fetchall()

if zones:
    for z in zones:
        pg_cursor.execute("""
            INSERT INTO sensor_zones (id, name, lat, lng, type, status, crop, moisture,
                temp, "rainForecast", battery, signal, "lastUpdate", "aiMode", "pumpOn",
                level, fazenda_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, lat = EXCLUDED.lat, lng = EXCLUDED.lng,
                type = EXCLUDED.type, status = EXCLUDED.status, crop = EXCLUDED.crop,
                moisture = EXCLUDED.moisture, temp = EXCLUDED.temp,
                "rainForecast" = EXCLUDED."rainForecast", battery = EXCLUDED.battery,
                signal = EXCLUDED.signal, "lastUpdate" = EXCLUDED."lastUpdate",
                "aiMode" = EXCLUDED."aiMode", "pumpOn" = EXCLUDED."pumpOn",
                level = EXCLUDED.level, fazenda_id = EXCLUDED.fazenda_id
        """, (z["id"], z["name"], z["lat"], z["lng"], z["type"], z["status"],
              z["crop"], z["moisture"], z["temp"], z["rainForecast"],
              z["battery"], z["signal"], z["lastUpdate"],
              bool(z["aiMode"]), bool(z["pumpOn"]),
              z["level"] if "level" in z.keys() else None,
              z["fazenda_id"]))
    print(f"  ✅ {len(zones)} sensor zone(s) migrada(s)")

    pg_cursor.execute("SELECT setval('sensor_zones_id_seq', (SELECT MAX(id) FROM sensor_zones))")
else:
    print("  ⚠️  Nenhum sensor encontrado no SQLite")

# ─── COMMIT FINAL ────────────────────────────────────────────────────────────

pg_conn.commit()

print("\n" + "="*50)
print("✅ Migração concluída com sucesso!")
print(f"   Fazendas:     {len(fazendas)}")
print(f"   Utilizadores: {len(usuarios)}")
print(f"   Sensores:     {len(zones)}")
print("="*50)

sqlite_conn.close()
pg_cursor.close()
pg_conn.close()
