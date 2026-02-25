from datetime import datetime, timedelta, timezone
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from database import get_db
from models import Fazenda, Usuario

# Configurações JWT (Em produção, coloque SECRET_KEY no .env)
SECRET_KEY = os.getenv("JWT_SECRET", "super_secret_key_hydrolean_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 Dias

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
router = APIRouter(tags=["Auth & Tenancy"])

# pwd_context foi removido para o MVP (Senhas em Plain Text a pedido do utilizador)

def verify_password(plain_password, hashed_password):
    # Comparação direta sem hash para o MVP
    return plain_password == hashed_password

def get_password_hash(password):
    # Retorna a senha em plain text para o MVP
    return password

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ============================================================
# DEPDENDÊNCIA DE SEGURANÇA (Multi-Tenant Middleware)
# ============================================================

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Decodifica o token JWT e retorna o utilizador.
    Pode ser usado nas rotas para injetar automaticamente o `fazenda_id` correto (Multi-Tenant).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
        
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise credentials_exception
    return user


# ============================================================
# ENDPOINTS
# ============================================================

@router.post("/register")
async def register(
    nome: str = Form(...),
    email: str = Form(...),
    senha: str = Form(...),
    fazenda_nome: str = Form(...),
    nif: str = Form(...),
    endereco: str = Form(...),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Registo Multi-Empresa. 
    1. Cria a nova estrutura (Fazenda/Tenant).
    2. Cria o Utilizador Admin associado a ela.
    Retorna imediatamente um JWT caso sucesso.
    """
    # Verifica se já existe o NIF ou Email
    if db.query(Fazenda).filter(Fazenda.nif == nif).first():
        raise HTTPException(status_code=400, detail="Este NIF já está registado.")
        
    if db.query(Usuario).filter(Usuario.email == email).first():
        raise HTTPException(status_code=400, detail="Este Email já está em uso.")

    # Guardar Logo Localmente (Simulação)
    logo_path = None
    if logo:
        # Criar pasta 'uploads' se não existir
        os.makedirs("uploads/logos", exist_ok=True)
        logo_path = f"uploads/logos/{logo.filename}"
        with open(logo_path, "wb") as f:
            content = await logo.read()
            f.write(content)

    try:
        # Transação Manual: Se o Utilizador falhar, a Fazenda dá Rollback
        nova_fazenda = Fazenda(
            nome=fazenda_nome,
            nif=nif,
            endereco=endereco,
            logo_url=f"/{logo_path}" if logo_path else None
        )
        db.add(nova_fazenda)
        db.flush() # Para gerar o ID da fazenda antes do commit

        novo_usuario = Usuario(
            nome=nome,
            email=email,
            senha_hash=get_password_hash(senha),
            role="admin",
            fazenda_id=nova_fazenda.id
        )
        db.add(novo_usuario)
        db.commit()

        # Emitir o JWT automaticamente apoós registo
        access_token = create_access_token(
            data={"sub": str(novo_usuario.id), "email": novo_usuario.email, "role": novo_usuario.role, "fazenda_id": nova_fazenda.id},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro interno ao criar conta: {str(e)}")


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Autenticação de Email e Senha (apesar de OAuth2 usar a key 'username' para o formData)
    """
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role, "fazenda_id": user.fazenda_id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: Usuario = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retorna o perfil do utilizador autenticado e a fazenda associada.
    """
    fazenda = db.query(Fazenda).filter(Fazenda.id == current_user.fazenda_id).first()
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "role": current_user.role,
        "fazenda_id": current_user.fazenda_id,
        "fazenda_nome": fazenda.nome if fazenda else None,
        "logo_url": fazenda.logo_url if fazenda else None
    }
