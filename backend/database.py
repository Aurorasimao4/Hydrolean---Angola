from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Cria ficheiro sqlite chamado hydrolean.db na mesma pasta (backend/hydrolean.db)
SQLALCHEMY_DATABASE_URL = "sqlite:///./hydrolean.db"

# connect_args={"check_same_thread": False} é necessário apenas no SQLite para contornar problemas 
# de acesso concorrente com FastAPI que não bloqueia o event loop em chamadas async
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe base a partir da qual todos os modelos herdarão
Base = declarative_base()

# Dependência do FastAPI para injetar a sessão da base de dados nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
