from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

from lib.supabase import supabase
from lib.mailer import send_otp_email

from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"])


class EmailSchema(BaseModel):
    email: str


class OTPVerifySchema(BaseModel):
    email: str
    otp: str


class ResetPasswordSchema(BaseModel):
    email: str
    otp: str
    newPassword: str


class LoginSchema(BaseModel):
    identifier: str
    password: str


@router.post("/forget-password")
def forget_password(body: EmailSchema):
    email = body.email

    res = supabase.schema("auths").table("users") \
        .select("email") \
        .eq("email", email) \
        .execute()

    data = res.data if res else None

    if not data:
        return {
            "message": "หากอีเมลนี้มีในระบบ เราจะส่ง OTP ไปให้"
        }

    otp = str(random.randint(100000, 999999))
    expired = (datetime.utcnow() + timedelta(minutes=5)).isoformat()

    supabase.table("password_reset_otps").insert({
        "email": email,
        "otp": otp,
        "expires_at": expired
    }).execute()

    send_otp_email(email, otp)

    return {
        "message": "ส่ง OTP เรียบร้อยแล้ว"
    }


@router.post("/verify-otp")
def verify_otp(body: OTPVerifySchema):
    res = supabase.table("password_reset_otps") \
        .select("*") \
        .eq("email", body.email) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    data = res.data[0] if res and res.data else None

    if not data:
        raise HTTPException(400, "OTP ไม่ถูกต้องหรือหมดอายุแล้ว")

    if datetime.fromisoformat(data["expires_at"]) < datetime.utcnow():
        raise HTTPException(400, "OTP หมดอายุแล้ว กรุณาขอใหม่")

    return {
        "message": "OTP ถูกต้อง",
        "verified": True
    }


@router.post("/reset-password")
def reset_password(body: ResetPasswordSchema):
    email = body.email
    otp = body.otp
    newPassword = body.newPassword

    if not email or not otp or not newPassword:
        raise HTTPException(400, "Missing data")

    res = supabase.table("password_reset_otps") \
        .select("*") \
        .eq("email", email) \
        .eq("used", False) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    data = res.data[0] if res and res.data else None

    if not data:
        raise HTTPException(400, "OTP ไม่ถูกต้อง")

    if data["otp"] != otp:
        raise HTTPException(400, "OTP ไม่ถูกต้อง")

    if datetime.fromisoformat(data["expires_at"]) < datetime.utcnow():
        raise HTTPException(400, "OTP หมดอายุ")

    hashedPassword = pwd_context.hash(newPassword)

    update = supabase.schema("auths").table("users") \
        .update({"password": hashedPassword}) \
        .eq("email", email) \
        .execute()

    if update.error:
        raise HTTPException(500, "เปลี่ยนรหัสไม่สำเร็จ")

    supabase.table("password_reset_otps") \
        .update({"used": True}) \
        .eq("id", data["id"]) \
        .execute()

    return {
        "message": "เปลี่ยนรหัสสำเร็จ"
    }


# login (เรียกใช้ของเดิม)
from controllers.authController import login

@router.post("/login")
async def login_route(request: Request):
    print("🔥 HIT LOGIN ROUTE")
    return await login(request)