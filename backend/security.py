from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

from dotenv import load_dotenv
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# Load environment variables from .env
load_dotenv()


# ---------------- PASSWORD HASHING ----------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------------- JWT SETTINGS ----------------

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


# ---------------- HTTP SECURITY ----------------

security = HTTPBearer()


# ---------------- PASSWORD FUNCTIONS ----------------

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# ---------------- JWT FUNCTIONS ----------------

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except Exception:
        return None


# ---------------- AUTHENTICATION GUARD ----------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    return payload