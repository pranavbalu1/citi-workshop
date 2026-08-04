from app.routers.auth import router as auth_router
from app.routers.users import router as users_router

from fastapi import FastAPI


app = FastAPI(
    title="Backend API",
    description="FastAPI backend",
    version="1.0.0",
)



@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


app.include_router(
    auth_router,
    prefix="/api",
)

app.include_router(
    users_router,
    prefix="/api",
)

