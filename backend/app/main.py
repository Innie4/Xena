from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import users

app = FastAPI(
    title="Xena API",
    description="Community finance coordination backend for Xena.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],                    # explicit origins handled by regex below
    allow_origin_regex=r"http://localhost:\d+|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)


@app.get("/health")
def health():
    return {"status": "ok"}
