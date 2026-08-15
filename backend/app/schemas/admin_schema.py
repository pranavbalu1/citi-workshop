from typing import Literal

from pydantic import BaseModel


class RoleUpdate(BaseModel):
    role: Literal["user", "admin"]


class UserStatusUpdate(BaseModel):
    is_active: bool
