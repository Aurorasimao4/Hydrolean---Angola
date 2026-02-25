from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float
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
    polygon_coordinates = Column(String, nullable=True) # JSON Array "[[-12.78, 15.73], ...]"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacionamento 1 para Muitos
    usuarios = relationship("Usuario", back_populates="fazenda", cascade="all, delete-orphan")
    zones = relationship("SensorZone", back_populates="fazenda", cascade="all, delete-orphan")


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(String, default="admin")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    fazenda_id = Column(Integer, ForeignKey("fazendas.id"), nullable=False)
    fazenda = relationship("Fazenda", back_populates="usuarios")

class SensorZone(Base):
    __tablename__ = "sensor_zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    type = Column(String, default="sensor") # "sensor" ou "tank"
    status = Column(String, default="optimal")
    
    # Valores Simulados
    crop = Column(String, nullable=True)
    moisture = Column(Integer, default=50)
    temp = Column(Integer, default=25)
    rainForecast = Column(String, default="Sem chuva")
    battery = Column(Integer, default=100)
    signal = Column(String, default="4G")
    lastUpdate = Column(String, default="Agora")
    aiMode = Column(Boolean, default=False)
    pumpOn = Column(Boolean, default=False)
    level = Column(Integer, nullable=True) # Apenas para tanks

    fazenda_id = Column(Integer, ForeignKey("fazendas.id"), nullable=False)
    fazenda = relationship("Fazenda", back_populates="zones")
