from collections.abc import Callable, Coroutine
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status

from app.api.dependencies.auth import CurrentUser
from app.core.roles import RoleName
from app.db.models import User

RoleDependency = Callable[..., Coroutine[Any, Any, User]]


def forbidden_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions.",
    )


def require_roles(*allowed_roles: RoleName) -> RoleDependency:
    if not allowed_roles:
        raise ValueError("At least one allowed role is required.")

    allowed_role_set = frozenset(allowed_roles)

    async def authorize_role(current_user: CurrentUser) -> User:
        try:
            current_role = RoleName(current_user.role.name)
        except ValueError as exc:
            raise forbidden_exception() from exc

        if current_role not in allowed_role_set:
            raise forbidden_exception()

        return current_user

    return authorize_role


WorkshopManagerUser = Annotated[
    User,
    Depends(require_roles(RoleName.WORKSHOP_MANAGER)),
]
ServiceAdvisorUser = Annotated[
    User,
    Depends(require_roles(RoleName.SERVICE_ADVISOR)),
]
MechanicUser = Annotated[
    User,
    Depends(require_roles(RoleName.MECHANIC)),
]
