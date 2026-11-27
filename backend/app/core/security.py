import secrets

from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError

password_hasher = PasswordHash.recommended()
dummy_password_hash = password_hasher.hash(secrets.token_urlsafe(32))


def hash_password(plain_password: str) -> str:
    return password_hasher.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(plain_password, password_hash)
    except UnknownHashError:
        return False
