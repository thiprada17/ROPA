from fastapi import APIRouter, Request
from controllers.formController import (
    getFormOptions,
    submitForm,
    updateForm,
    getActivityById,
    getRopaList,
)

router = APIRouter()


@router.get("/options")
async def options(request: Request):
    return await getFormOptions(request)


@router.post("/submit")
async def submit(request: Request):
    return await submitForm(request)


@router.put("/{activityId}")
async def update(activityId: str, request: Request):
    return await updateForm(activityId, request)


@router.get("/activity/{activityId}")
async def get_activity(activityId: str):
    return await getActivityById(activityId)


@router.get("/")
async def ropa_list(request: Request):
    return await getRopaList(request)