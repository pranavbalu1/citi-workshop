from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.repositories import user_repository


print("AUTH_SERVICE: module loading")


async def register_user(
    db: AsyncSession,
    username: str,
    email: str,
    password: str,
):
    print(f"AUTH_SERVICE: registration started for {email}")

    print("AUTH_SERVICE: checking if user already exists")

    existing_user = await user_repository.find_by_email(
        db,
        email,
    )

    print("AUTH_SERVICE: existing-user lookup finished")

    if existing_user:
        print(
            "AUTH_SERVICE: registration rejected - email exists"
        )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    print("AUTH_SERVICE: hashing password")

    password_hash = hash_password(password)

    print("AUTH_SERVICE: password hashed")

    print("AUTH_SERVICE: creating user")

    user = await user_repository.create_user(
        db,
        {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "role": "user",
            "is_active": True,
        },
    )

    print("AUTH_SERVICE: registration completed")

    return user


async def login_user(
    db: AsyncSession,
    email: str,
    password: str,
):
    print(f"AUTH_SERVICE: login started for {email}")

    print("AUTH_SERVICE: starting user lookup")

    user = await user_repository.find_by_email(
        db,
        email,
    )

    print("AUTH_SERVICE: user lookup finished")

    if not user:
        print("AUTH_SERVICE: user not found")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    print("AUTH_SERVICE: user found")

    print("AUTH_SERVICE: starting password verification")

    try:
        password_valid = verify_password(
            password,
            user.password_hash,
        )
    except Exception as e:
        print(
            "AUTH_SERVICE: password verification FAILED: "
            f"{type(e).__name__}: {e}"
        )
        raise

    print(
        "AUTH_SERVICE: password verification finished: "
        f"valid={password_valid}"
    )

    if not password_valid:
        print("AUTH_SERVICE: invalid password")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    print("AUTH_SERVICE: creating access token")

    try:
        token = create_access_token(
            user_id=str(user.id),
            role=user.role,
        )
    except Exception as e:
        print(
            "AUTH_SERVICE: token creation FAILED: "
            f"{type(e).__name__}: {e}"
        )
        raise

    print("AUTH_SERVICE: access token created")

    return token