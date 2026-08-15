from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_current_user_id,
    require_role,
)

from app.database.postgres import get_db

from app.services.users_service import (
    get_user_by_id,
    promote_user,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me")
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    print("ME ROUTE HIT")
    print("USER ID:", user_id)

    current_user = await get_user_by_id(
        db,
        user_id,
    )

    if not current_user:
        return {
            "error": "User not found"
        }

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }

