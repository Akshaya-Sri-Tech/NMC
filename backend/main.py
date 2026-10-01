from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import supabase

from backend.routes.aiml import router as aiml_router
from backend.routes.ingestion import router as ingestion_router
from backend.routes.human_evaluation import router as human_evaluation_router
from backend.routes.nmc import router as nmc_router


app = FastAPI()


# =========================================================
# CORS - Allow React frontend to access this backend
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sangamin.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "SIH-099 Backend is running!"
    }


@app.get("/api/test-db")
def test_db():

    response = (
        supabase
        .table("cpse")
        .select("*")
        .limit(1)
        .execute()
    )

    return {
        "message": "Database connection successful!",
        "data": response.data
    }


app.include_router(ingestion_router)
app.include_router(aiml_router)
app.include_router(human_evaluation_router)
app.include_router(nmc_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )