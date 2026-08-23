# Routing Architecture

**Product Name:** Ishara  
**Frameworks:** React Navigation (Mobile), Express.js / WebSockets (Backend), FastAPI (ML)

This document maps out the internal routing for the mobile application and the API endpoints that connect the ESP32 hardware to the backend and machine learning services.

---

## 1. Mobile App Navigation (React Native)

The mobile application utilizes a standard stack and tab navigation structure (e.g., via React Navigation or Expo Router) to manage the user interfaces.

### Navigation Tree

```text
RootStack/
├── Splash (Loads hardware connection status)
├── Auth/ (AuthNavigator)
│   ├── Login
│   └── Register
├── Main/ (MainTabNavigator - Bottom Tabs)
│   ├── TranslationTab (Default Route)
│   ├── CalibrationTab
│   └── SettingsTab
└── Fullscreen Screens/ (Hide bottom tab bar)
    ├── RecognizingScreen
    ├── TranslationScreen
    ├── SignDetailScreen
    ├── CategoryDetailScreen
    ├── GloveSettingsScreen
    ├── CalibrationScreen
    ├── AboutScreen
    └── EditProfileScreen
```

---

## 2. API & WebSocket Architecture

The Ishara backend infrastructure relies heavily on WebSockets for low-latency streaming, supported by REST APIs for configuration and state management.

### 2.1. Node.js Backend Server (Port: 3000)

**WebSocket Routes (Socket.io):**
- **Namespace:** `/` (Root)
- **Events:**
  - `connection` / `disconnect`
  - Custom events managed via `registerEsp32Handlers`
- **Function:** Ingests raw data from the ESP32 hardware and forwards it to the ML Service, then broadcasts predictions to the React Native Mobile App in real-time.

**REST Routes:**
- `/auth/*` - Authentication and user management endpoints.
- `/profile/*` - Fetches and updates current user settings and calibration profiles.
- `/history/*` - Manages translation history and saved phrases.

### 2.2. Python ML FastAPI Server (Port: 8000)

**REST Routes:**
- `POST /predict`
  - **Client:** Node.js Backend.
  - **Payload:** Normalized sensor data array.
  - **Function:** Passes the data through the trained ML model (`prediction.py`) and returns the predicted gesture class and confidence probability.
  
- `POST /calibrate`
  - **Client:** Node.js Backend.
  - **Payload:** Raw calibration data.
  - **Function:** Updates the in-memory calibration baselines to normalize future prediction requests dynamically.
