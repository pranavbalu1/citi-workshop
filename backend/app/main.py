from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.admin import router as admin_router
from mangum import Mangum

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.health import router as health_router


print("MAIN: loading application")

app = FastAPI()

print("MAIN: FastAPI application created")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://production.d2nsd9vdjw66gt.amplifyapp.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


print("MAIN: CORS configured")


@app.get("/")
async def root():
    print("MAIN: root endpoint called")

    return {
        "message": "API is running"
    }


app.include_router(
    health_router,
    prefix="/api",
)

app.include_router(
    auth_router,
    prefix="/api",
)

app.include_router(
    users_router,
    prefix="/api",
)

app.include_router(
    admin_router,
    prefix="/api",
)

print("MAIN: routers registered")


handler = Mangum(app)

print("MAIN: Mangum handler created")
print("MAIN: application initialization complete")
