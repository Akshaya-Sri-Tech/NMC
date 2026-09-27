
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from main import run_pipeline


app = FastAPI(
    title="NMC AI/ML API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StandardizeRequest(BaseModel):

    materials: List[Dict[str, Any]]


@app.get("/")
def root():

    return {
        "message": "NMC AI/ML API is running"
    }


@app.post("/standardize")
def standardize(request: StandardizeRequest):

    try:

        result = run_pipeline(
            request.materials
        )

        return {
            "success": True,
            "results": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8001
    )
