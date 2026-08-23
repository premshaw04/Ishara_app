# Folder Structure

**Product Name:** Ishara  
**Architecture:** Monorepo (Hardware + Backend + Frontend + ML)

This document outlines the root directory structure for the Ishara project, detailing where the hardware scripts, web servers, machine learning models, and mobile application code reside.

---

## Root Architecture

```text
Ishara/
├── .venv/                         # Python Virtual Environment for ML dependencies
├── backend/                       # Node.js WebSocket & API Server
│   ├── src/
│   │   ├── config/                # Environment and database configurations
│   │   ├── controllers/           # Route logic controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── models/                # Database models
│   │   ├── routes/                # Express routing (authRoutes.js, profileRoutes.js)
│   │   ├── services/              # Business logic
│   │   ├── sockets/               # Socket.io handlers
│   │   └── server.js              # Entry point for the Node.js server
│   ├── .env                       # Backend environment variables
│   ├── package.json
│   └── test_fetch.js              # Utility script for testing internal endpoints
│
├── frontend/                      # React Native / Expo Mobile Application
│   ├── assets/                    # Images, fonts, and icons
│   ├── src/
│   │   ├── api/                   # API clients
│   │   ├── components/            # Reusable UI components
│   │   ├── constants/             # App constants
│   │   ├── data/                  # Static data
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── navigation/            # React Navigation configuration (Root, Tabs, Auth)
│   │   ├── screens/               # Main application screens
│   │   ├── services/              # API services
│   │   ├── store/                 # Global state management
│   │   ├── theme/                 # Styling and theme
│   │   ├── types/                 # TypeScript interfaces and types
│   │   ├── utils/                 # Helper functions
│   │   └── App.tsx                # Mobile app root component
│   ├── index.js                   # Mobile app entry point
│   ├── .env                       # Frontend environment variables
│   └── package.json
│
├── ishara_ml___model/             # Python ML Service (FastAPI) & Data Pipeline
│   ├── models/                    # Saved ML models
│   ├── convert_dataset.py         # Script to convert dataset formats
│   ├── data_collection.py         # Script to record serial data for model training
│   ├── prediction.py              # Real-time inference script / FastAPI server
│   ├── test_api.py                # Script to test the ML endpoints
│   ├── train_model.py             # Script to train the ML model
│   ├── gestures_dataset.csv       # The collected dataset of sensor readings
│   ├── calibration_profile.json   # Baseline sensor values for the current user
│   └── requirements.txt           # Python dependencies (FastAPI, uvicorn, scikit-learn, etc.)
│
├── ESP32/                         # Hardware Firmware
│   ├── main/
│   │   └── main.ino               # Arduino/C++ sketch for reading sensors and connecting to WebSockets
│   └── include/                   # Hardware library dependencies (MPU6050, WiFi)
│
├── docs/                          # Project Documentation
│   ├── 01_PRD.md                  # Product Requirement Document
│   ├── 02_Design_System.md        # UI/UX guidelines for the mobile app
│   ├── 03_Folder_Structure.md     # (This file)
│   └── 04_Routing_Architecture.md # Mobile and API routing logic
│
├── Ishara_Demo_Video.mp4          # Working demo video of the project
├── Ishara_Presentation.pptx       # Pitch deck / Presentation
└── create_submission.ps1          # Utility script to package the project for hackathon submission
```

---

## Component Responsibilities

### 1. `backend/` (Node.js)
Acts as the central router for real-time data. It holds open WebSocket connections from the `ESP32` and routes that raw data over to the `ishara_ml___model` FastAPI server. Once a prediction is returned, the backend broadcasts it to the connected `frontend` mobile clients.

### 2. `frontend/` (React Native)
The user-facing mobile application. It connects to the Node.js backend to receive the translated text, updates the UI dynamically, and uses the device's native Text-to-Speech API to vocalize the translated words when confidence exceeds 70%.

### 3. `ishara_ml___model/` (Python)
The intelligence layer of the system. It handles offline tasks like `data_collection.py` for recording new gestures into the `gestures_dataset.csv`, and online tasks like running `prediction.py` on port 8000 to serve real-time inferences based on user's specific `calibration_profile.json`.

### 4. `ESP32/`
The C++ firmware that runs directly on the wearable glove. It handles I2C communication with the MPU6050, reads analog values from flex sensors, and manages the Wi-Fi/WebSocket connection to stream data at high frequencies with minimal overhead.
