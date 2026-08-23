# Ishara: Real-Time Sign Language & Gesture Translation

Welcome to the Ishara project repository! Ishara bridges the communication gap by translating hand gestures into spoken language in real-time using IoT and Machine Learning.

## 🚀 Live Demo & Assets

- **Deployed Working Demo:** exp+ishara://expo-development-client/?url=http%3A%2F%2F10.94.200.36%3A8081
- **Demo Video:** Ishara_prasunethon_2.0_demo_video
- **Presentation Deck:** Prasunethon 2.0_Kalki_Narula Institute of Technology  (3)

---

## 📖 Documentation
All technical documentation can be found in the `/docs` folder:
1. [`01_PRD.md`](./docs/01_PRD.md) - Product Requirements and Architecture
2. [`02_Design_System.md`](./docs/02_Design_System.md) - Mobile App UI/UX Guidelines
3. [`03_Folder_Structure.md`](./docs/03_Folder_Structure.md) - Codebase Organization
4. [`04_Routing_Architecture.md`](./docs/04_Routing_Architecture.md) - API & Navigation Routing

## 🛠️ Project Structure
- **/frontend:** React Native (Expo) mobile application.
- **/backend:** Node.js WebSocket server for real-time data routing.
- **/ishara_ml___model:** Python FastAPI server handling the Machine Learning predictions.
- **/ESP32:** Hardware C++ scripts for the gesture glove (MPU6050 & Flex sensors).

## 💻 How to Run Locally

### 1. Backend (Node.js)
```bash
cd backend
npm install
npm start
```

### 2. ML Inference (Python)
```bash
cd ishara_ml___model
pip install -r requirements.txt
uvicorn prediction:app --reload
```

### 3. Frontend (React Native)
```bash
cd frontend
npm install
npm run start
```
