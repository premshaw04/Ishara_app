# Product Requirement Document (PRD)

**Product Name:** Ishara  
**Version:** 1.0  
**Tagline:** Real-Time Sign Language & Gesture Translation System

## 1. Project Overview

### Vision Statement
Ishara aims to bridge the communication gap between individuals with speech or hearing impairments and the general public by translating hand gestures into spoken language in real-time. By utilizing low-cost IoT hardware and advanced Machine Learning models, Ishara provides an accessible and scalable solution for seamless communication.

### Mission
To provide an affordable, highly accurate, and portable hardware-software system that empowers users to communicate effortlessly using natural hand gestures. 

### Problem Statement
Individuals relying on sign language or specific gestures often face significant communication barriers with those who do not understand these languages. Traditional translators are expensive, and many existing technological solutions are bulky, slow, or lack real-time conversational capabilities.

### Our Solution
Ishara provides a complete end-to-end platform consisting of:
- **IoT Hardware (ESP32):** A wearable glove equipped with flex sensors and IMUs (e.g., MPU6050) to capture precise hand movements and orientations.
- **Node.js Backend:** A high-speed WebSocket server that receives hardware data and routes it instantly.
- **Python ML Inference Server (FastAPI):** A dedicated machine learning service that processes raw sensor data and predicts the corresponding gesture with high accuracy.
- **React Native Mobile App:** A user-friendly, TypeScript-based mobile interface that displays translated text, features an "Auto-Speak" text-to-speech function, and includes a robust calibration wizard.

---

## 2. Product Goals

### Primary Goals
- Translate hand gestures to text and speech in real-time.
- Ensure lag-free data transmission between hardware and mobile app via WebSockets.
- Maintain a high prediction accuracy (target >90%).
- Provide a reliable, user-friendly calibration process for different hand sizes.
- Prevent false positives by limiting the Auto-Speak translation feature to a >70% confidence threshold.

---

## 3. Success Metrics (KPIs)

| KPI | Target |
|---|---|
| Gesture Recognition Accuracy | >90% |
| Sensor Data Latency (ESP32 -> Node) | <50 ms |
| Total Translation Latency (End-to-End) | <200 ms |
| Auto-Speak Confidence Threshold | >70% |
| Mobile App Crash Rate | <1% |

---

## 4. Target Audience
- Individuals with speech or hearing impairments.
- Relatives, friends, and colleagues of impaired individuals.
- Medical rehabilitation centers.
- Special education institutions.

---

## 5. Product Scope (MVP)

### Included in MVP

#### Hardware (ESP32)
- Sensor data acquisition (Flex sensors + Accelerometer/Gyroscope).
- Real-time Wi-Fi/WebSocket data transmission to backend.

#### Mobile Application (React Native / TypeScript)
- Bluetooth/Wi-Fi connection status.
- Real-time translation display (Text).
- Auto-Speak (Text-to-Speech) functionality (triggered at >70% confidence).
- Hardware Calibration Wizard.

#### Backend / Infrastructure
- Node.js server with Socket.io and modular Express REST APIs (/auth, /profile, /history).
- Python FastAPI ML Inference service running on port 8000.
- Machine Learning model trained on custom `gestures_dataset.csv`.
- `calibration_profile.json` management.

### Out of Scope (MVP)
- Two-way translation (Speech to Sign Language avatar).
- Multi-language translation (MVP supports English primarily).
- Integration with smartwatches.

---

## 6. Functional Requirements

### Data Acquisition & Processing
- The ESP32 must sample sensor data at a consistent frequency and transmit it over WebSockets.
- The Python ML Server must expose an endpoint or socket connection to receive data, process it, and return a predicted class and confidence score.

### Mobile Application
- **Calibration Wizard:** Must guide the user through capturing baseline sensor readings for flat-hand and closed-fist positions.
- **Translation View:** Must clearly display the translated word/phrase.
- **Audio Output:** The app must utilize the device's native TTS engine to speak the translated text if the confidence threshold is met.

### Backend Communication
- The Node.js server must handle multiple concurrent connections via Socket.io (Hardware + Mobile App) and route data efficiently without blocking the event loop.

---

## 7. System Architecture
1. **ESP32 Glove:** Captures analog and I2C data, serializes it, and sends it via WebSockets.
2. **Node.js Server:** Acts as the central hub, receiving raw data and forwarding it to the ML service.
3. **Python FastAPI (ML Service):** Receives the forwarded data array, normalizes it using `calibration_profile.json`, runs inference, and returns the result.
4. **Node.js Server:** Receives the prediction and broadcasts it to the connected React Native mobile client.
5. **React Native App:** Updates the UI and triggers Text-to-Speech.
