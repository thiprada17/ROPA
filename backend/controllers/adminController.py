from fastapi import Request, HTTPException
from lib.supabase import supabase


async def createUser(request: Request):
    try:
        body = await request.json()

        fullName = body.get("fullName")
        email = body.get("email")
        password = body.get("password")
        phone = body.get("phone")
        position = body.get("position")
        department = body.get("department")
        team = body.get("team")
        role = body.get("role")

        if not email or not password or not fullName:
            raise HTTPException(status_code=400, detail="Missing required fields")

        res = supabase.schema("auths").table("users") \
            .insert([{
                "username": fullName,
                "email": email,
                "password": password,
                "phone": phone,
                "department_id": department,
                "position": team,
                "role": role,
                "status": "ACTIVE",
                "is_locked": False,
                "failed_login_attempts": 0,
            }]) \
            .execute()

        if hasattr(res, "error") and res.error:
            print("SUPABASE ERROR:", res.error)
            raise HTTPException(status_code=500, detail=str(res.error))

        return {
            "message": "User created successfully",
            "user": res.data[0] if res.data else None
        }

    except Exception as err:
        print(err)
        raise HTTPException(status_code=500, detail="Server error")


async def getUsers(request: Request):
    try:
        res = supabase.schema("auths").table("users") \
            .select("""
                *,
                departments (
                    department_name
                )
            """) \
            .execute()

        if hasattr(res, "error") and res.error:
            print(res.error)
            raise HTTPException(status_code=500, detail=str(res.error))

        return res.data

    except Exception as err:
        raise HTTPException(status_code=500, detail="Server error")


async def editUser(user_id: str, request: Request):
    try:
        body = await request.json()

        fullName = body.get("fullName")
        email = body.get("email")
        password = body.get("password")
        phone = body.get("phone")
        department = body.get("department")
        team = body.get("team")
        role = body.get("role")
        lockStatus = body.get("lockStatus")
        accountStatus = body.get("accountStatus")

        if not fullName or not email:
            raise HTTPException(status_code=400, detail="Missing required fields")

        update_data = {
            "username": fullName,
            "email": email,
            "phone": phone,
            "department_id": department,
            "position": team,
            "role": role,
            "is_locked": True if lockStatus == "Locked" else False,
            "status": "ACTIVE" if accountStatus == "Active" else "INACTIVE",
        }

        if password:
            update_data["password"] = password

        res = supabase.schema("auths").table("users") \
            .update(update_data) \
            .eq("id", user_id) \
            .execute()

        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "message": "User updated successfully",
            "user": res.data[0]
        }
    except Exception as err:
        print(err)
    raise HTTPException(status_code=500, detail=str(err))

async def deleteUser(user_id: str, request: Request):
    try:

        res = supabase.schema("auths").table("users") \
            .delete() \
            .eq("id", user_id)\
            .execute()

        if hasattr(res, "error") and res.error:
            print("SUPABASE ERROR:", res.error)
            raise HTTPException(status_code=500, detail=str(res.error))

        return {
            "message": "User delete successfully",
        }

    except Exception as err:
        print(err)
        raise HTTPException(status_code=500, detail="Server error")
