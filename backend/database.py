import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Em produção (Render), usa PostgreSQL via DATABASE_URL
# Em desenvolvimento, usa SQLite local
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hydrolean2.db")

# Render usa URLs com prefixo "postgres://" (legacy), SQLAlchemy 2.x precisa de "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuração do engine (SQLite precisa de check_same_thread=False)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
