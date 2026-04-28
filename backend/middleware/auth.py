from fastapi import Request, HTTPException, Depends
import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="No token")

    try:
        token = auth_header.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return decoded  # 👈 แทน req.user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")


def require_admin(user=Depends(verify_token)):
    if user.get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user