from typing import Annotated

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.tokens import InvalidAccessTokenError, decode_access_token
from app.db.models import User
from app.db.session import get_db_session
from app.repositories.users import get_user_by_id

bearer_scheme = HTTPBearer(auto_error=False)


def unauthorized_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Security(bearer_scheme),
    ],
    session: Annotated[AsyncSession, Depends(get_db_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized_exception()

    try:
        claims = decode_access_token(credentials.credentials, settings)
    except InvalidAccessTokenError as exc:
        raise unauthorized_exception() from exc

    user = await get_user_by_id(session, claims.user_id)
    if user is None or not user.is_active:
        raise unauthorized_exception()

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
