from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import CurrentUser
from app.core.config import Settings, get_settings
from app.db.session import get_db_session
from app.schemas.auth import CurrentUserResponse, LoginRequest, LoginResponse
from app.services.auth import (
    InvalidCredentialsError,
    InvalidRefreshSessionError,
    authenticate_user,
    refresh_access_token,
    revoke_refresh_session,
)

router = APIRouter(prefix="/auth", tags=["authentication"])


def _validate_cookie_request_origin(request: Request, settings: Settings) -> None:
    origin = request.headers.get("origin")
    if origin is None or origin not in settings.cors_origins:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Request origin is not allowed.",
        )


def _refresh_unauthorized(settings: Settings) -> HTTPException:
    expired_cookie = Response()
    expired_cookie.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.refresh_cookie_path,
        secure=settings.refresh_cookie_secure,
        httponly=True,
        samesite="lax",
    )
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not refresh session.",
        headers={
            "WWW-Authenticate": "Bearer",
            "Set-Cookie": expired_cookie.headers["set-cookie"],
        },
    )


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    responses={status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"}},
)
async def get_current_user_profile(current_user: CurrentUser) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(current_user)


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
            remember_me=payload.remember_me,
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
        max_age=(
            settings.remembered_refresh_session_expire_seconds
            if payload.remember_me
            else None
        ),
        expires=result.refresh_session_expires_at if payload.remember_me else None,
        path=settings.refresh_cookie_path,
        secure=settings.refresh_cookie_secure,
        httponly=True,
        samesite="lax",
    )
    return LoginResponse(
        access_token=result.access_token,
        expires_in=result.access_token_expires_in,
    )


@router.post(
    "/refresh",
    response_model=LoginResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Invalid refresh session"},
        status.HTTP_403_FORBIDDEN: {"description": "Disallowed request origin"},
    },
)
async def refresh(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> LoginResponse:
    _validate_cookie_request_origin(request, settings)
    raw_refresh_token = request.cookies.get(settings.refresh_cookie_name)
    if raw_refresh_token is None:
        raise _refresh_unauthorized(settings)

    try:
        result = await refresh_access_token(
            session=session,
            raw_refresh_token=raw_refresh_token,
            settings=settings,
        )
    except InvalidRefreshSessionError as exc:
        raise _refresh_unauthorized(settings) from exc

    return LoginResponse(
        access_token=result.access_token,
        expires_in=result.access_token_expires_in,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={status.HTTP_403_FORBIDDEN: {"description": "Disallowed request origin"}},
)
async def logout(
    request: Request,
    response: Response,
    session: Annotated[AsyncSession, Depends(get_db_session)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    _validate_cookie_request_origin(request, settings)
    raw_refresh_token = request.cookies.get(settings.refresh_cookie_name)

    if raw_refresh_token is not None:
        await revoke_refresh_session(
            session=session,
            raw_refresh_token=raw_refresh_token,
        )

    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.refresh_cookie_path,
        secure=settings.refresh_cookie_secure,
        httponly=True,
        samesite="lax",
    )
