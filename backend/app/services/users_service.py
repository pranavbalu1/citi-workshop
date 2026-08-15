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
