from fastapi import Request, HTTPException
from lib.supabase import supabase
import bcrypt
import jwt
import os

from models.user import (
    findUserByIdentifier,
    incrementFailedAttempts,
    resetFailedAttempts,
)

JWT_SECRET = os.getenv("JWT_SECRET")


async def login(request: Request):
    body = await request.json()

    identifier = body.get("identifier")
    password = body.get("password")

    if not identifier or not identifier.strip() or not password:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "Identifier and password are required",
            },
        )

    try:
        user = await findUserByIdentifier(identifier.strip())

        if not user:
            raise HTTPException(
                status_code=401,
                detail={
                    "success": False,
                    "error": "Invalid username/email or password",
                    "code": "INVALID_CREDENTIALS",
                },
            )

        if user.get("is_lock"):
            raise HTTPException(
                status_code=403,
                detail={
                    "success": False,
                    "error": "Account locked. Please contact administrator.",
                    "code": "ACCOUNT_LOCKED",
                },
            )

        if user.get("status") != "ACTIVE":
            raise HTTPException(
                status_code=403,
                detail={
                    "success": False,
                    "error": "Account is not active. Please contact administrator.",
                    "code": "ACCOUNT_INACTIVE",
                },
            )

        stored_password = user.get("password", "")
        isPasswordValid = False

        if stored_password.startswith("$2b$"):
            isPasswordValid = bcrypt.checkpw(
                password.encode(), stored_password.encode()
            )
        else:
            isPasswordValid = password == stored_password

        if not isPasswordValid:
            result = await incrementFailedAttempts(
                user["id"],
                user.get("failed_login_attempts") or 0,
            )

            newAttempts = result["newAttempts"]
            shouldLock = result["shouldLock"]

            if shouldLock:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "success": False,
                        "error": "Account locked due to too many failed attempts.",
                        "code": "ACCOUNT_LOCKED",
                    },
                )

            remaining = 5 - newAttempts

            raise HTTPException(
                status_code=401,
                detail={
                    "success": False,
                    "error": f"Invalid username/email or password. {remaining} attempt{'' if remaining == 1 else 's'} remaining.",
                    "code": "INVALID_CREDENTIALS",
                },
            )

        await resetFailedAttempts(user["id"])

        token = jwt.encode(
            {"userId": user["id"], "role": user["role"]},
            JWT_SECRET,
            algorithm="HS256",
        )

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "username": user.get("username"),
                "email": user.get("email"),
                "role": user.get("role"),
                "department": user.get("department"),
                "position": user.get("position"),
            },
        }

    except HTTPException:
        raise
    except Exception as err:
        print("[Login Error]", err)
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Internal server error",
            },
        )


def authenticate(request: Request):
    auth_header = request.headers.get("authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": "Authentication required. Please login.",
                "code": "AUTH_REQUIRED",
            },
        )

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        request.state.user = decoded
        return decoded
    except Exception as err:
        print("[Auth Middleware Error]", str(err))

        error_message = (
            "Token expired"
            if err.__class__.__name__ == "ExpiredSignatureError"
            else "Invalid token"
        )

        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": error_message,
                "code": "INVALID_TOKEN",
            },
        )