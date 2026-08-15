from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

import jwt

from app.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


def decode_access_token(token: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        print("PAYLOAD:", payload)

        return payload

    except jwt.InvalidTokenError as e:
        print("JWT ERROR:", e)
        raise credentials_exception


async def get_current_user_id(
    token: str = Depends(oauth2_scheme)
) -> str:

    print("TOKEN:", token)

    payload = decode_access_token(token)

    user_id = payload.get("sub")

    print("USER ID:", user_id)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    return user_id


async def get_current_user_role(
    token: str = Depends(oauth2_scheme)
) -> str:

    print("ROLE CHECK: validating token")

    payload = decode_access_token(token)

    role = payload.get("role")

    print("USER ROLE:", role)

    if role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User role missing from token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    return role


def require_role(required_role: str):

    async def role_dependency(
        role: str = Depends(get_current_user_role),
    ) -> str:

        print(
            f"ROLE AUTHORIZATION: "
            f"required={required_role}, actual={role}"
        )

        if role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return role

    return role_dependency
