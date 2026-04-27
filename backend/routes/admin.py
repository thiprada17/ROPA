from fastapi import APIRouter, Depends, HTTPException, Request
from lib.supabase import supabase
from middleware.auth import verify_token, require_admin
from controllers.adminController import createUser, getUsers, editUser, deleteUser

router = APIRouter()


@router.post("/users")
async def create_user_route(request: Request, user=Depends(require_admin)):
    return await createUser(request)


@router.get("/departments")
async def get_departments():
    try:
        res = supabase.schema("auths").table("departments") \
            .select("id, department_name") \
            .execute()

        if hasattr(res, "error") and res.error:
            raise HTTPException(status_code=500, detail="Failed to fetch departments")

        return res.data

    except Exception as err:
        print(err)
        raise HTTPException(status_code=500, detail="Server error")


@router.get("/users/get")
async def get_users_route(request: Request):
    return await getUsers(request)


@router.put("/edit/{user_id}")
async def edit_user_route(user_id: str, request: Request, user=Depends(require_admin)):
    return await editUser(user_id, request)

@router.delete("/delete/{user_id}")
async def delete_user_route(user_id: str, request: Request, user=Depends(require_admin)):
    return await deleteUser(user_id, request)

