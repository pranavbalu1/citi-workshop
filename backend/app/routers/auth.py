from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.postgres import get_db
from app.schemas.user_schema import UserCreate, Token
from app.services.auth_service import (
    register_user,
    login_user,
)


print("AUTH_ROUTER: module loading")


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
async def register(
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    print(f"AUTH_ROUTER: POST /register for {user.email}")

    try:
        created_user = await register_user(
            db=db,
            username=user.username,
            email=user.email,
            password=user.password,
        )

        print("AUTH_ROUTER: registration successful")

        return {
            "message": "User created successfully",
            "user_id": str(created_user.id),
        }

    except Exception as e:
        print(
            "AUTH_ROUTER: registration FAILED: "
            f"{type(e).__name__}: {e}"
        )
        raise


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    print(
        f"AUTH_ROUTER: POST /login for "
        f"{form_data.username}"
    )

    try:
        print("AUTH_ROUTER: calling login_user")

        access_token = await login_user(
            db=db,
            email=form_data.username,
            password=form_data.password,
        )

        print("AUTH_ROUTER: login_user completed")

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except Exception as e:
        print(
            "AUTH_ROUTER: login FAILED: "
            f"{type(e).__name__}: {e}"
        )
        raise
