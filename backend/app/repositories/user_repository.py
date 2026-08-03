from app.database.mongodb import get_database



db = get_database()
collection = db["users"]

async def find_by_email(email: str):
    return await collection.find_one({
        "email": email
    })

async def find_by_username(username: str):
    return await collection.find_one({
        "username": username
    })

async def get_by_id(user_id: str):
    return await collection.find_one({
        "_id": user_id
    })

async def create_user(user_data: dict):
    result = await collection.insert_one(user_data)

    user_data["_id"] = result.inserted_id

    return user_data
