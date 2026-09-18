from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes import complaints, queues, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivicFlow API",
    description="Backend for the CivicFlow civic complaint intelligence pipeline.",
    version="0.1.0",
)

# Open CORS for the hackathon so the frontend/Mapbox teammates can hit this
# from any dev port without friction. Documented here, not a production claim.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)
app.include_router(queues.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "CivicFlow API", "docs": "/docs"}
