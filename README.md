# Ishara: Real-Time Sign Language & Gesture Translation

Welcome to the **Ishara** project repository! Ishara bridges the communication gap by translating hand gestures into spoken language in real-time using **IoT and Machine Learning**.

Ishara is an end-to-end assistive communication system built around a wearable **ESP32-based gesture glove**, a real-time **Node.js communication layer**, a **Python FastAPI ML inference service**, and a **React Native mobile application**.

The system captures hand movements through flex sensors and an MPU6050 IMU, processes the sensor data using a trained machine learning model, and converts recognized gestures into text and speech.

---

## ✨ Key Features

* 🤖 **Real-time gesture recognition** using Machine Learning.
* 🧤 **Wearable gesture glove** based on ESP32, flex sensors, and MPU6050.
* ⚡ **Low-latency communication** using WebSockets.
* 🧠 **Dedicated ML inference service** built with Python and FastAPI.
* 📱 **React Native mobile application** for real-time translation.
* 🔊 **Auto-Speak** converts recognized gestures into spoken language when the prediction confidence is high enough.
* 🎯 **Hardware calibration wizard** for adapting the glove to different users.
* 📊 **Confidence-based translation** to reduce incorrect spoken outputs.
* 🔄 **End-to-end data flow** from hardware → backend → ML model → mobile application.

---

## 🚀 How It Works

```text
┌──────────────────────┐
│     ESP32 Glove      │
│                      │
│  Flex Sensors        │
│  MPU6050 IMU         │
└──────────┬───────────┘
           │
           │ Sensor Data
           ▼
┌──────────────────────┐
│    Node.js Backend   │
│                      │
│ WebSocket / Socket.io│
│ Real-time Data Relay │
└──────────┬───────────┘
           │
           │ Sensor Data
           ▼
┌──────────────────────┐
│ Python ML Service    │
│                      │
│ FastAPI              │
│ Gesture Prediction   │
│ Confidence Score     │
└──────────┬───────────┘
           │
           │ Prediction
           ▼
┌──────────────────────┐
│ React Native App     │
│                      │
│ Translation Display  │
│ Auto-Speak / TTS     │
│ Calibration           │
└──────────────────────┘
```

### Translation Flow

1. The **ESP32 glove** collects readings from the flex sensors and MPU6050.
2. Sensor data is transmitted in real-time to the **Node.js backend**.
3. The backend forwards the data to the **Python FastAPI ML service**.
4. The ML service normalizes the sensor data using the calibration profile and predicts the gesture.
5. The prediction and confidence score are returned to the Node.js server.
6. The backend sends the result to the connected **React Native application**.
7. The mobile application displays the translated text.
8. When the confidence threshold is satisfied, **Auto-Speak** converts the translation into speech.

---

## 🚀 Live Demo & Assets

* **Deployed Working Demo:** `exp+ishara://expo-development-client/?url=http%3A%2F%2F10.94.200.36%3A8081`
* **Demo Video:** `kalki_demo_video.mp4`
* **Presentation Deck:** `Prasunethon 2.0_Kalki_Narula Institute of Technology (3).pptx`

> **Note:** The Expo development-client URL is intended for the development environment/network where the application is running. It may not be accessible from outside that environment.

---

## 📖 Documentation

All technical documentation can be found in the `/docs` folder:

1. [`01_PRD.md`](./docs/01_PRD.md) - Product Requirements and Architecture
2. [`02_Design_System.md`](./docs/02_Design_System.md) - Mobile App UI/UX Guidelines
3. [`03_Folder_Structure.md`](./docs/03_Folder_Structure.md) - Codebase Organization
4. [`04_Routing_Architecture.md`](./docs/04_Routing_Architecture.md) - API & Navigation Routing

The PRD contains the main system requirements, product goals, hardware/software scope, functional requirements, and end-to-end architecture.

---

## 🛠️ Project Structure

```text
Ishara_app/
│
├── frontend/                 # React Native (Expo) mobile application
│
├── backend/                  # Node.js WebSocket/Socket.io server
│
├── ishara_ml___model/        # Python FastAPI ML inference service
│
├── ESP32/
│   └── gloves_cpp/           # ESP32 gesture glove firmware
│
├── docs/                     # Project documentation
│   ├── 01_PRD.md
│   ├── 02_Design_System.md
│   ├── 03_Folder_Structure.md
│   └── 04_Routing_Architecture.md
│
├── requirements.txt          # Python dependencies
├── create_submission.ps1     # Submission/helper script
├── kalki_demo_video.mp4      # Project demonstration video
├── Prasunethon 2.0_Kalki_Narula Institute of Technology (3).pptx
└── README.md
```

### Main Components

* **`/frontend`** — React Native / Expo mobile application.
* **`/backend`** — Node.js server responsible for real-time communication and routing sensor/prediction data.
* **`/ishara_ml___model`** — Python FastAPI service responsible for ML-based gesture prediction.
* **`/ESP32/gloves_cpp`** — ESP32 firmware for the wearable gesture glove.
* **`/docs`** — Product, design, architecture, and project documentation.

---

## 🧰 Technology Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Mobile App       | React Native, Expo, TypeScript           |
| Backend          | Node.js, Express, Socket.io / WebSockets |
| ML Service       | Python, FastAPI                          |
| Machine Learning | Custom gesture recognition model         |
| Hardware         | ESP32                                    |
| Sensors          | Flex Sensors, MPU6050 IMU                |
| Communication    | Wi-Fi / WebSockets                       |
| Output           | Text + Text-to-Speech                    |

---

## 💻 How to Run Locally

### Prerequisites

Make sure the following are installed:

* Node.js and npm
* Python 3.x
* Expo CLI / Expo development environment
* ESP32 development environment if running the hardware
* Required Python and Node.js dependencies

---

### 1. Backend — Node.js

```bash
cd backend
npm install
npm start
```

The backend acts as the real-time communication layer between the ESP32 hardware, ML service, and mobile application.

---

### 2. ML Inference — Python

```bash
cd ishara_ml___model
pip install -r requirements.txt
uvicorn prediction:app --reload
```

The FastAPI service handles gesture prediction and returns the predicted class together with its confidence score.

The ML service is configured to run on **port 8000** according to the project requirements.

---

### 3. Frontend — React Native / Expo

```bash
cd frontend
npm install
npm run start
```

Then open the application using an available Expo development environment.

The mobile application provides:

* Hardware connection status
* Real-time translation
* Calibration
* Translated text display
* Auto-Speak / Text-to-Speech

---

### 4. ESP32 Gesture Glove

Open the firmware located in:

```text
ESP32/gloves_cpp/
```

Configure the required Wi-Fi/network and sensor settings for your environment, then flash the firmware to the ESP32.

The glove uses:

* **Flex sensors** to capture finger bending.
* **MPU6050** to capture accelerometer/gyroscope information.
* **Wi-Fi/WebSocket communication** to transmit sensor data.

---

## 🎯 Calibration

Ishara includes a calibration workflow to establish baseline sensor values for the user.

The calibration process is designed to account for differences in:

* Hand size
* Finger positioning
* Sensor placement
* Natural sensor readings

The calibration profile is then used by the ML pipeline to normalize incoming sensor data before prediction.

---

## 🔊 Confidence-Based Auto-Speak

To reduce accidental or incorrect speech output, Ishara uses a confidence threshold for Auto-Speak.

The current project specification uses:

```text
Confidence > 70%
        ↓
Auto-Speak enabled
```

Lower-confidence predictions can still be displayed as translations, while automatic speech output is restricted to sufficiently confident predictions.

---

## 📊 Project Targets

The current PRD defines the following target KPIs:

| Metric                         |  Target |
| ------------------------------ | ------: |
| Gesture Recognition Accuracy   |    >90% |
| ESP32 → Node Latency           |  <50 ms |
| End-to-End Translation Latency | <200 ms |
| Auto-Speak Confidence          |    >70% |
| Mobile App Crash Rate          |     <1% |

These are **project targets**, not guaranteed measured production results.

---

## 🔐 Configuration & Environment

Before running the complete system, make sure the communication addresses used by the frontend, backend, ML service, and ESP32 are configured for your local network.

For development:

```text
ESP32
  │
  │ Wi-Fi
  ▼
Node.js Backend
  │
  │ WebSocket / API
  ▼
FastAPI ML Service
  │
  ▼
React Native App
```

Avoid committing private credentials, API keys, local network configuration, or other environment-specific secrets to the repository.

---

## 📌 Current MVP Scope

### Included

* ESP32 sensor data acquisition
* Flex sensor + MPU6050 input
* Real-time Wi-Fi/WebSocket communication
* ML-based gesture recognition
* React Native translation interface
* Hardware calibration
* Text-to-Speech / Auto-Speak
* Confidence-based output
*  Two-way speech-to-sign-language translation

### Out of Scope

The current MVP does **not** include:

* Full multi-language translation
* Sign-language avatar generation

These items are identified as outside the current MVP scope in the project PRD.

---

## 🧪 Development Notes

Ishara is currently structured as a multi-component prototype. For the complete experience, the **ESP32 firmware, Node.js backend, ML service, and React Native application** need to be configured to communicate with each other on the same development environment/network.

For implementation details, refer to the documentation in [`/docs`](./docs).

---

## 👥 Project

**Ishara** — Real-Time Sign Language & Gesture Translation

Built with **IoT + Machine Learning + React Native + Node.js + FastAPI** to make gesture-based communication more accessible.

---
