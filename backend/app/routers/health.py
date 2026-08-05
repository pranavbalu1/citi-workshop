from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("/")
async def health_check():
    return {"status": "healthy"}


@router.get("/jwt")
async def jwt_health_check(
    current_user_id = Depends(get_current_user_id)
):
    print(current_user_id, "is accessing the health check")
    return {
        "status": "healthy",
        "current_user_id": current_user_id,
        "authenticated": True
    }
