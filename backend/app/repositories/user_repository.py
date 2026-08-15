from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_model import User


async def find_by_email(
    db: AsyncSession,
    email: str,
):
    result = await db.execute(
        select(User).where(User.email == email)
    )

    return result.scalar_one_or_none()


async def find_by_username(
    db: AsyncSession,
    username: str,
):
    result = await db.execute(
        select(User).where(User.username == username)
    )

    return result.scalar_one_or_none()


async def find_by_id(
    db: AsyncSession,
    user_id: str,
):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )

    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    user_data: dict,
):
    user = User(
        username=user_data["username"],
        email=user_data["email"],
        password_hash=user_data["password_hash"],
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    return user
