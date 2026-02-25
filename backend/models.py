from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Fazenda(Base):
    __tablename__ = "fazendas"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True, nullable=False)
    nif = Column(String, unique=True, index=True, nullable=False)
    endereco = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamento 1 para Muitos
    usuarios = relationship("Usuario", back_populates="fazenda", cascade="all, delete-orphan")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(String, default="admin")  # admin, operador, visualizador
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Chave Estrangeira ligando à Fazenda (Garante o Multi-Tenant)
    fazenda_id = Column(Integer, ForeignKey("fazendas.id"), nullable=False)
    
    # Back-reference
    fazenda = relationship("Fazenda", back_populates="usuarios")
