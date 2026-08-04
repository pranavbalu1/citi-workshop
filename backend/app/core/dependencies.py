from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

import jwt

from app.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


async def get_current_user_id(
    token: str = Depends(oauth2_scheme)
) -> str:

    print("TOKEN:", token)

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

        user_id = payload.get("sub")

        print("USER ID:", user_id)

        if user_id is None:
            raise credentials_exception

        return user_id

    except jwt.InvalidTokenError as e:
        print("JWT ERROR:", e)
        raise credentials_exception
