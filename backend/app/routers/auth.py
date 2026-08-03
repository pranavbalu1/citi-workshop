from fastapi import APIRouter

from app.schemas.user_schema import UserCreate, Token, UserLogin
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

    print("Created User:", created_user)  # Debugging line

    return {
        "message": "User created successfully",
        "user_id": str(created_user["_id"]),
    }


@router.post("/login", response_model=Token)
async def login(user: UserLogin):

    access_token = await login_user(
        email=user.email,
        password=user.password,
    )

    print("Access Token:", access_token)  # Debugging line
    print("User Email:", user.email)  # Debugging line

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }
