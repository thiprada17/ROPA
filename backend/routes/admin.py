from fastapi import APIRouter, Depends, HTTPException
from lib.supabase import supabase
from typing import Optional

router = APIRouter()


def verify_token():
    return {"role": "Admin"}  

def require_admin(user=Depends(verify_token)):
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user



@router.post("/users")
def create_user(data: dict, user=Depends(require_admin)):
    try:
        res = supabase.schema("auths").table("users").insert({
            "username": data.get("fullName"),
            "email": data.get("email"),
            "password": data.get("password"),
            "phone": data.get("phone"),
            "department_id": data.get("department"),
            "position": data.get("team"),
            "role": data.get("role"),
            "status": "ACTIVE",
            "is_locked": False,
            "failed_login_attempts": 0
        }).execute()

        return {"message": "User created", "data": res.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users")
def get_users():
    try:
        res = supabase.schema("auths").table("users").select("*").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/departments")
def get_departments():
    try:
        res = supabase.schema("auths").table("departments") \
            .select("id, department_name").execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/edit")
def edit_user(data: dict, user=Depends(require_admin)):
    try:
        user_id = data.get("id")

        res = supabase.schema("auths").table("users") \
            .update(data) \
            .eq("id", user_id) \
            .execute()

        return {"message": "Updated", "data": res.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))