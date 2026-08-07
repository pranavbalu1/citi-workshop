from pymongo import AsyncMongoClient

from app.core.config import settings


print("MONGO: module loading")
print(f"MONGO: database configured = {settings.MONGODB_DATABASE}")
print(f"MONGO: URI configured = {bool(settings.MONGODB_URI)}")

client = AsyncMongoClient(
    settings.MONGODB_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
)

print("MONGO: client created")

database = client[settings.MONGODB_DATABASE]

print("MONGO: database object created")


async def mongodb_health_check():
    print("MONGO: health check started")

    try:
        result = await client.admin.command("ping")
        print(f"MONGO: ping successful: {result}")
        return {"status": "healthy"}
    except Exception as e:
        print(f"MONGO: ping FAILED: {type(e).__name__}: {e}")
        return {"status": "unhealthy", "error": str(e)}


async def connect_to_mongodb():
    print("MONGO: starting connection ping")

    try:
        result = await client.admin.command("ping")
        print(f"MONGO: ping successful: {result}")
    except Exception as e:
        print(f"MONGO: ping FAILED: {type(e).__name__}: {e}")
        raise


async def close_mongodb_connection():
    print("MONGO: closing connection")

    try:
        await client.close()
        print("MONGO: connection closed")
    except Exception as e:
        print(f"MONGO: close FAILED: {type(e).__name__}: {e}")


def get_database():
    print("MONGO: get_database() called")
    return database
