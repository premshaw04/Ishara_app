import os
import joblib
import uvicorn
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Union, Optional, Dict

# =====================================
# App Configuration & Model Loading
# =====================================

app = FastAPI(
    title="Ishara AI Sign Language Translator API",
    description="Real-time sign language gesture recognition powered by Random Forest ML & FastAPI.",
    version="1.0.0"
)

# Enable CORS so Expo / React Native apps and local clients can easily connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "gesture_model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

model = None
label_encoder = None
feature_names = ["Thumb", "Index", "Middle", "Ring", "Pinky", "AccX", "AccY", "AccZ", "GyroX", "GyroY", "GyroZ"]

# Load model upon application startup
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print(f"✅ Loaded ML Model ({len(label_encoder.classes_)} gestures vocabulary) from '{MODEL_DIR}/' successfully!")
    else:
        print("⚠️ Warning: Trained ML model or label encoder not found in 'models/' directory. Please run 'train_model.py' first.")
except Exception as e:
    print(f"❌ Error loading models: {e}")

# =====================================
# Pydantic Schemas for Input Validation
# =====================================

class SensorInput(BaseModel):
    Thumb: Union[float, int] = Field(..., example=240, description="Thumb flex sensor ADC reading")
    Index: Union[float, int] = Field(..., example=17, description="Index flex sensor ADC reading")
    Middle: Union[float, int] = Field(..., example=0, description="Middle flex sensor ADC reading")
    Ring: Union[float, int] = Field(..., example=975, description="Ring flex sensor ADC reading")
    Pinky: Union[float, int] = Field(..., example=2514, description="Pinky flex sensor ADC reading")
    AccX: Union[float, int] = Field(..., example=-3492, description="MPU6050 Accelerometer X")
    AccY: Union[float, int] = Field(..., example=16228, description="MPU6050 Accelerometer Y")
    AccZ: Union[float, int] = Field(..., example=5816, description="MPU6050 Accelerometer Z")
    GyroX: Union[float, int] = Field(..., example=-762, description="MPU6050 Gyroscope X")
    GyroY: Union[float, int] = Field(..., example=-19, description="MPU6050 Gyroscope Y")
    GyroZ: Union[float, int] = Field(..., example=2200, description="MPU6050 Gyroscope Z")

class RawArrayInput(BaseModel):
    values: List[Union[float, int]] = Field(..., example=[240, 17, 0, 975, 2514, -3492, 16228, 5816, -762, -19, 2200])

class RawStringInput(BaseModel):
    data: str = Field(..., example="240,17,0,975,2514,-3492,16228,5816,-762,-19,2200", description="Comma-separated string of 11 sensor integers directly from ESP32")

class PredictionResponse(BaseModel):
    status: str
    prediction: str
    confidence: float
    probabilities: Optional[Dict[str, float]] = None

# =====================================
# Helper Function for Inference
# =====================================

def perform_prediction(sensor_values: list) -> dict:
    if model is None or label_encoder is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded on server. Please verify 'gesture_model.pkl' and 'label_encoder.pkl' exist in models directory.")
    
    if len(sensor_values) != 11:
        raise HTTPException(status_code=400, detail=f"Expected exactly 11 sensor readings, but received {len(sensor_values)}.")

    # Format input into DataFrame with appropriate feature columns to prevent scikit-learn warnings
    df_input = pd.DataFrame([sensor_values], columns=feature_names)
    
    # Run predictions
    pred_idx = model.predict(df_input)[0]
    predicted_gesture = label_encoder.inverse_transform([pred_idx])[0]
    
    # Compute probability scores
    probs_array = model.predict_proba(df_input)[0]
    confidence_pct = float(np.max(probs_array) * 100)
    
    # Build complete vocabulary breakdown mapping
    all_probs = {
        label: round(float(prob * 100), 2)
        for label, prob in zip(label_encoder.classes_, probs_array)
        if prob > 0.001 # Filter out extreme zeroes for cleaner response
    }
    
    # Sort probabilities descending
    all_probs = dict(sorted(all_probs.items(), key=lambda item: item[1], reverse=True))

    return {
        "status": "success",
        "prediction": predicted_gesture,
        "confidence": round(confidence_pct, 2),
        "probabilities": all_probs
    }

# =====================================
# API Endpoints
# =====================================

@app.get("/", tags=["General"])
async def root():
    """Health check and general API diagnostic statistics."""
    loaded = (model is not None and label_encoder is not None)
    return {
        "status": "online",
        "service": "Ishara Sign Language Translator API",
        "model_loaded": loaded,
        "vocabulary_count": len(label_encoder.classes_) if loaded else 0,
        "supported_gestures": list(label_encoder.classes_) if loaded else [],
        "documentation": "/docs"
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_gesture_structured(data: SensorInput):
    """Predict sign gesture from structured JSON containing named sensor parameters."""
    sensor_list = [
        data.Thumb, data.Index, data.Middle, data.Ring, data.Pinky,
        data.AccX, data.AccY, data.AccZ,
        data.GyroX, data.GyroY, data.GyroZ
    ]
    return perform_prediction(sensor_list)

@app.post("/predict-array", response_model=PredictionResponse, tags=["Prediction"])
async def predict_gesture_array(data: RawArrayInput):
    """Predict sign gesture from a clean JSON integer list of 11 sensor values."""
    return perform_prediction(data.values)

@app.post("/predict-raw", response_model=PredictionResponse, tags=["Prediction"])
async def predict_gesture_raw_string(data: RawStringInput):
    """Predict sign gesture directly from a comma-separated serial string (Ideal for low-memory ESP32 requests)."""
    try:
        parts = [v.strip() for v in data.data.split(",") if v.strip() != ""]
        sensor_vals = [float(p) for p in parts]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid non-numeric string characters detected in raw sensor data.")
    
    return perform_prediction(sensor_vals)

# =====================================
# WebSocket Endpoint for Real-Time Streaming
# =====================================

@app.websocket("/ws/predict")
async def websocket_realtime_stream(websocket: WebSocket):
    """
    Real-Time WebSocket Stream for continuous 50Hz translation communication with ESP32 & React Native App!
    Accepts raw comma-separated sensor strings (e.g., '240,17,0,975,2514,-3492,16228,5816,-762,-19,2200')
    and streams back JSON prediction translations immediately.
    """
    await websocket.accept()
    print("⚡ WebSocket Connected: Real-time gesture prediction stream active!")
    
    try:
        while True:
            # Receive text stream (usually raw CSV line from ESP32 or mobile bridge)
            msg = await websocket.receive_text()
            
            try:
                parts = [v.strip() for v in msg.split(",") if v.strip() != ""]
                sensor_vals = [float(p) for p in parts]
                
                if len(sensor_vals) == 11:
                    result = perform_prediction(sensor_vals)
                    await websocket.send_json({
                        "event": "gesture_translated",
                        "gesture": result["prediction"],
                        "confidence": result["confidence"],
                        "timestamp": pd.Timestamp.now().isoformat()
                    })
                else:
                    await websocket.send_json({
                        "event": "error",
                        "message": f"Expected 11 sensor items, got {len(sensor_vals)}"
                    })
            except ValueError:
                await websocket.send_json({
                    "event": "error",
                    "message": "Unreadable or corrupted numeric data received."
                })
    except WebSocketDisconnect:
        print("🔌 WebSocket Disconnected.")
    except Exception as e:
        print(f"❌ WebSocket Stream Exception: {e}")
        await websocket.close()

# =====================================
# Main Uvicorn Server Launch
# =====================================

if __name__ == "__main__":
    # Listening on 0.0.0.0 allows physical devices (ESP32 / Phones) on your Wi-Fi network to connect to your PC's local IP!
    print("\n🚀 Starting Ishara Sign Language Translation API Server on http://0.0.0.0:8000...")
    print("📖 Interactive API Docs available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
