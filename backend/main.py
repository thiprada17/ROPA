from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, admin, form, dpo

app = FastAPI(
    title="My API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(form.router, prefix="/api/form")
app.include_router(dpo.router, prefix="/api/dpo")

@app.get("/")
def root():
    return {"message": "Server running"}