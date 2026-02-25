import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()  # Carrega o .env antes de ler DATABASE_URL

# Usa PostgreSQL (Render em produção, ou a URL externa do Render em desenvolvimento)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL não está definida. "
        "Define-a no ficheiro .env com a External URL do PostgreSQL do Render."
    )

# Render usa URLs com prefixo "postgres://" (legacy), SQLAlchemy 2.x precisa de "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
