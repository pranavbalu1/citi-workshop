from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import user_repository
from app.repositories.user_repository import find_all, find_by_id, delete_user, update_user_role, update_user_status


async def get_all_users(
    db: AsyncSession,
):
    return await find_all(db)


async def get_user(
    db: AsyncSession,
    user_id: str,
):
    return await find_by_id(
        db,
        user_id,
    )


async def delete_user(
    db: AsyncSession,
    user_id: str,
):
    return await delete_user(
        db,
        user_id,
    )

async def update_user_role(
    db: AsyncSession,
    user_id: str,
    role: str,
):
    return await update_user_role(
        db,
        user_id,
        role,
    )


async def update_user_status(
    db: AsyncSession,
    user_id: str,
    is_active: bool,
):
    return await update_user_status(
        db,
        user_id,
        is_active,
    )
