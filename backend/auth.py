"""
Authentication (Bonus Option D).

Simple, dependency-free auth using the standard library:
  - passwords hashed with PBKDF2-HMAC-SHA256 + per-user salt
  - login issues a random bearer token stored in the database
  - a FastAPI dependency validates the token on protected routes

This is intentionally lightweight for a prototype. A production system would
use vetted libraries (e.g. passlib/bcrypt) and signed JWTs with expiry.
"""
import hashlib
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import database as db

_bearer = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    """Return (hash_hex, salt). Generates a new salt if none is given."""
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return digest.hex(), salt


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    computed, _ = hash_password(password, salt)
    return secrets.compare_digest(computed, password_hash)


def create_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    db.save_token(token, user_id)
    return token


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
):
    """FastAPI dependency: resolve the bearer token to a user, or 401."""
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Please log in.",
        )
    user_id = db.get_user_id_for_token(creds.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
        )
    user = db.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return {"id": user["id"], "username": user["username"]}
