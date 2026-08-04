from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user_schema import UserCreate, Token
from app.services.auth_service import register_user, login_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
async def register(user: UserCreate):

    created_user = await register_user(
        username=user.username,
        email=user.email,
        password=user.password,
    )

    return {
        "message": "User created successfully",
        "user_id": str(created_user["_id"]),
    }


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    access_token = await login_user(
        email=form_data.username,
        password=form_data.password,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }