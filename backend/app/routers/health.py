from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
from app.database.postgres import postgres_health_check  as check_postgres


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
async def health_check():
    return {"status": "healthy, version 1.0.0"}


@router.get("/postgres")
async def postgres_health_check_endpoint():
    return await check_postgres()


@router.get("/jwt")
async def jwt_health_check(
    current_user_id: str = Depends(get_current_user_id),
):
    print(
        f"{current_user_id} is accessing the JWT health check"
    )

    return {
        "status": "healthy",
        "current_user_id": current_user_id,
        "authenticated": True,
    }
