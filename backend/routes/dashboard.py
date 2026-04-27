from fastapi import APIRouter, Request
from controllers.dashboardController import *

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def summary(request: Request):
    return await getDashboardSummary(request)

@router.get("/total")
async def total(request: Request):
    return await getDashboardTotal(request)

@router.get("/approval")
async def approval(request: Request):
    return await getDashboardApproval(request)

@router.get("/donut")
async def donut(request: Request):
    return await getDashboardDonut(request)

@router.get("/trend")
async def trend(request: Request):
    return await getDashboardTrend(request)

@router.get("/comparison")
async def comparison(request: Request):
    return await getDashboardComparison(request)

@router.get("/activities")
async def activities(request: Request):
    return await getDashboardActivities(request)

@router.get("/raw")
async def raw_list(request: Request):
    return await getDashboardRawList(request)