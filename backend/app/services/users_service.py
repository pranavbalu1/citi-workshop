from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import find_by_id, update_user_role, update_user_status


async def get_user_by_id(
    db: AsyncSession,
    user_id: str,
):
    user = await find_by_id(
        db,
        user_id,
    )

    return user


async def promote_user(
    db: AsyncSession,
    user_id: str,
):
    user = await update_user_role(
        db,
        user_id,
        "admin",
    )

    return user


async def update_user_status(
    db: AsyncSession,
    user_id: str,
    is_active: bool,
):
    user = await update_user_status(
        db,
        user_id,
        is_active,
    )

    return user
