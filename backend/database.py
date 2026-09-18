"""
Database setup for CivicFlow backend.
SQLite for the hackathon, but only through SQLAlchemy Core/ORM so swapping
to Postgres/Mongo later just means changing DATABASE_URL (Mongo would need
a different models.py, but the rest of the app doesn't care).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./civicflow.db"

# check_same_thread=False is needed only because SQLite + FastAPI's default
# threaded dev server touch the connection from different threads.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a session, always closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
