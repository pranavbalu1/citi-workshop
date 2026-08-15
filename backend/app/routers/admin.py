from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.database.postgres import get_db
from app.schemas.admin_schema import (
    RoleUpdate,
    UserStatusUpdate,
)
from app.services.admin_service import (
    get_all_users,
    get_user,
    delete_user,
    update_user_role,
    update_user_status,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    users = await get_all_users(db)

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        }
        for user in users
    ]


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    user = await get_user(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }


@router.delete("/users/{user_id}")
async def remove_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    user = await delete_user(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "message": "User deleted successfully",
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: str,
    role_update: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    user = await update_user_role(
        db,
        user_id,
        role_update.role,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "message": "User role updated successfully",
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }


@router.patch("/users/{user_id}/status")
async def change_user_status(
    user_id: str,
    status_update: UserStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(require_role("admin")),
):
    user = await update_user_status(
        db,
        user_id,
        status_update.is_active,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "message": "User status updated successfully",
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
    }
