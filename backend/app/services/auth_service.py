from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password
)

from app.repositories import user_repository


async def register_user(
    username: str,
    email: str,
    password: str
):
    existing_user = await user_repository.find_by_email(email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    password_hash = hash_password(password)

    user = await user_repository.create_user({
        "username": username,
        "email": email,
        "password_hash": password_hash
    })

    return user


async def login_user(
    email: str,
    password: str
):
    user = await user_repository.find_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(
        str(user["_id"])
    )

    return token
