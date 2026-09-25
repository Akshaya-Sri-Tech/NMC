
import os
import requests
from dotenv import load_dotenv


load_dotenv()

AIML_API_URL = os.getenv("AIML_API_URL")


def standardize_materials(materials):

    if not AIML_API_URL:
        raise ValueError(
            "AIML_API_URL is not configured"
        )

    payload = {
        "materials": materials
    }

    response = requests.post(
        AIML_API_URL,
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    return response.json()

