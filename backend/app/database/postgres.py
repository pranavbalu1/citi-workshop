from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


print("POSTGRES: module loading")
print(f"POSTGRES: DATABASE_URL configured = {bool(settings.DATABASE_URL)}")


class Base(DeclarativeBase):
    pass


database_url = settings.DATABASE_URL

# SQLAlchemy's async psycopg dialect uses:
#
# postgresql+psycopg://
#
# instead of:
#
# postgresql://
#
async_database_url = database_url.replace(
    "postgresql://",
    "postgresql+psycopg://",
    1,
)

engine = create_async_engine(
    async_database_url,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
)


AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


async def postgres_health_check():
    print("POSTGRES: health check started")

    try:
        async with engine.connect() as connection:
            from sqlalchemy import text

            result = await connection.execute(
                text("SELECT 1")
            )

            result.scalar_one()

        print("POSTGRES: ping successful")

        return {
            "status": "healthy"
        }

    except Exception as e:
        print(
            f"POSTGRES: ping FAILED: "
            f"{type(e).__name__}: {e}"
        )

        return {
            "status": "unhealthy",
            "error": str(e),
        }


async def connect_to_postgres():
    print("POSTGRES: starting connection ping")

    try:
        async with engine.connect() as connection:
            from sqlalchemy import text

            result = await connection.execute(
                text("SELECT 1")
            )

            result.scalar_one()

        print("POSTGRES: ping successful")

    except Exception as e:
        print(
            f"POSTGRES: ping FAILED: "
            f"{type(e).__name__}: {e}"
        )

        raise


async def close_postgres_connection():
    print("POSTGRES: closing connection")

    try:
        await engine.dispose()

        print("POSTGRES: connection closed")

    except Exception as e:
        print(
            f"POSTGRES: close FAILED: "
            f"{type(e).__name__}: {e}"
        )
