from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

from lib.supabase import supabase
from middleware.auth import verify_token, require_admin
from controllers.dpoController import createApprove, getComment

router = APIRouter()

@router.post("/approval")
async def approve_route(request: Request, user=Depends(verify_token)):
    return await createApprove(request, user)

@router.get("/comment/get")
async def get_comment_route(request: Request, activity_id: str):
    return await getComment(request, activity_id)