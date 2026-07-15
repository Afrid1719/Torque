from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.db.session import get_db_session
from app.schemas.auth import LoginRequest, LoginResponse
from app.services.auth import InvalidCredentialsError, authenticate_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={status.HTTP_401_UNAUTHORIZED: {"description": "Invalid credentials"}},
)
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> LoginResponse:
    user_agent = request.headers.get("user-agent")
    if user_agent is not None:
        # Match the maximum length of UserSession.user_agent.
        user_agent = user_agent[:512]
    # IPv6 addresses fit within the UserSession.ip_address column limit.
    ip_address = request.client.host[:45] if request.client is not None else None

    try:
        result = await authenticate_user(
            session=session,
            username=payload.username,
            plain_password=payload.password,
            settings=settings,
            user_agent=user_agent,
            ip_address=ip_address,
        )
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=result.refresh_token,
        max_age=settings.refresh_session_expire_seconds,
        expires=result.refresh_session_expires_at,
        path=settings.refresh_cookie_path,
        secure=settings.refresh_cookie_secure,
        httponly=True,
        samesite="lax",
    )
    return LoginResponse(
        access_token=result.access_token,
        expires_in=result.access_token_expires_in,
    )
