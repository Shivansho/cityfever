"""
CivicFlow — Backend Application Entrypoint
===========================================
Member 2 | Central integration backend connecting ML, priority scoring,
duplicate clustering, SQLite database, and frontend dashboard.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes import complaints, queues, dashboard

# Initialize SQLite database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicFlow API",
    description="Municipal Operations & Civic Incident Intelligence Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration (allows frontend on Vite dev server)
FRONTEND_ORIGIN = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    FRONTEND_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "*"  # Development mode allowance
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(complaints.router, prefix="/api")
app.include_router(queues.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "healthy",
        "service": "CivicFlow Backend",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    host = os.getenv("BACKEND_HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
