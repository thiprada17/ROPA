from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from lib.supabase import supabase
from middleware.auth import require_admin
import bcrypt

router = APIRouter()


class UserCreate(BaseModel):
    fullName: str
    email: str
    password: str
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    team: Optional[str] = None
    role: Optional[str] = "User"



@router.post("/users")
def create_user(body: UserCreate, user=Depends(require_admin)):
    try:
        # hashed_password = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()

        response = supabase.schema("auths").table("users").insert({
            "username": body.fullName,
            "email": body.email,
            "password": body.password,
            "phone": body.phone,
            "department_id": body.department,
            "position": body.team,
            "role": body.role,
            "status": "ACTIVE",
            "is_locked": False,
            "failed_login_attempts": 0
        }).execute()

        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {
            "message": "User created successfully",
            "user": response.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/users")
def get_users(user=Depends(require_admin)):
    try:
        response = supabase.schema("auths").table("users").select("""
            *,
            departments (
                department_name
            )
        """).execute()

        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}")
def edit_user(user_id: str, body: UserCreate, user=Depends(require_admin)):
    try:
        response = supabase.schema("auths").table("users").update({
            "username": body.fullName,
            "email": body.email,
            "password": body.password,
            "phone": body.phone,
            "department_id": body.department,
            "position": body.team,
            "role": body.role,
        }).eq("id", user_id).execute()

        if response.error:
            raise HTTPException(status_code=500, detail=response.error.message)

        return {
            "message": "User updated successfully",
            "user": response.data[0]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))