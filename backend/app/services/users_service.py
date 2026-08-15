from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import user_repository


async def get_user_by_id(
    db: AsyncSession,
    user_id: str,
):
    user = await user_repository.find_by_id(
        db,
        user_id,
    )

    return user


async def promote_user(
    db: AsyncSession,
    user_id: str,
):
    user = await user_repository.update_user_role(
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
    user = await user_repository.update_user_status(
        db,
        user_id,
        is_active,
    )

    return user
