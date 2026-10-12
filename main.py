from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Spam Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Locate the saved model files
BASE_DIR = Path(__file__).resolve().parent

# Load the trained model and its matching vectorizer
model = joblib.load(BASE_DIR / "spam_model.pkl")
vectorizer = joblib.load(BASE_DIR / "spam_vectorizer.pkl")


class MessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)


@app.get("/")
def home():
    return {"message": "Spam Detection API is running"}


@app.post("/predict")
def predict_spam(request: MessageRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    # Convert the message into TF-IDF features
    features = vectorizer.transform([message])

    # Predict the class
    prediction = model.predict(features)[0]

    # Get the model's estimated probability of spam
    classes = list(model.classes_)
    spam_index = classes.index("spam")

    spam_probability = model.predict_proba(features)[0][spam_index]

    return {
        "message": message,
        "prediction": prediction,
        "spam_probability": round(float(spam_probability), 4)
    }