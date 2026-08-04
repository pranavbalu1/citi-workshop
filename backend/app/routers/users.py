from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.repositories.user_repository import find_by_id

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me")
async def get_me(
    user_id: str = Depends(get_current_user_id)
):
    print("ME ROUTE HIT")
    print("USER ID:", user_id)

    current_user = await find_by_id(user_id)
    return user_id