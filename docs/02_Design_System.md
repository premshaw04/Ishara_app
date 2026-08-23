# Design System

**Product Name:** Ishara Mobile App  
**Platform:** React Native (iOS / Android)  

## 1. Core Philosophy
The Ishara design system prioritizes **accessibility, clarity, and high contrast**. Because users will likely be communicating in real-world environments (both indoors and outdoors) and the app provides critical accessibility services, the UI must be instantly readable, highly responsive, and require minimal interaction during active translation.

## 2. Color Palette

### Primary Colors
- **Brand Blue:** `#0A84FF` (Used for primary actions, active connection states, and prominent buttons)
- **Success Green:** `#30D158` (Used to indicate successful hardware connection, successful calibration, and high-confidence translations)
- **Warning Yellow:** `#FFD60A` (Used for low-confidence warnings or pending calibrations)
- **Error Red:** `#FF453A` (Used for hardware disconnection alerts or failed ML inferences)

### Neutral Colors (Dark Mode Optimized)
*Note: Ishara defaults to a Dark Theme to save battery life and reduce glare during continuous usage.*
- **Background:** `#000000` (Pure black for OLED efficiency)
- **Surface:** `#1C1C1E` (Card backgrounds, modals, input fields)
- **Border:** `#38383A` (Dividers, borders)

### Typography Colors
- **Primary Text:** `#FFFFFF` (High contrast for main translation text)
- **Secondary Text:** `#EBEBF5` (60% opacity for labels, status indicators, and subtitles)
- **Disabled Text:** `#EBEBF5` (30% opacity)

---

## 3. Typography
**Font Family:** System Default (San Francisco on iOS, Roboto on Android) to ensure maximum native legibility.

- **Display (Translation Output):** `Font Weight: Bold, Size: 48px, Line Height: 56px`
- **Header 1 (Screen Titles):** `Font Weight: Bold, Size: 32px, Line Height: 40px`
- **Header 2 (Section Titles):** `Font Weight: SemiBold, Size: 24px, Line Height: 32px`
- **Body (Instructions/Status):** `Font Weight: Regular, Size: 16px, Line Height: 24px`
- **Caption (Small Labels):** `Font Weight: Regular, Size: 12px, Line Height: 16px`

---

## 4. Key UI Components

### 4.1. The Translation Display
The primary view of the app.
- **Layout:** Takes up the top 60% of the screen.
- **Styling:** Large Display typography. The text color dynamically changes based on the ML confidence score.
  - **>70% Confidence (Auto-Speak Active):** White text, subtle green pulse animation.
  - **<70% Confidence (Auto-Speak Disabled):** Secondary text color, subtle warning icon next to the text indicating uncertain translation.

### 4.2. Connection Status Indicator
A pill-shaped badge located at the top right of the navigation header.
- **Connected:** Surface background, Green dot icon, "Connected" text.
- **Disconnected:** Surface background, Red dot icon, "Offline" text.
- **Calibrating:** Surface background, Yellow spinning icon, "Calibrating..." text.

### 4.3. Calibration Wizard Cards
Used during the hardware setup phase.
- **Container:** Rounded corners (`borderRadius: 16px`), Surface color background (`#1C1C1E`).
- **Interaction:** Smooth horizontal swipe transitions between steps (e.g., "Open Hand" -> "Fist").
- **Visual Aids:** High-contrast line-art illustrations of the hand positions required for calibration.

### 4.4. Primary Action Buttons
- **Style:** Full-width, 56px height, `borderRadius: 12px`.
- **Active State:** Brand Blue background, White text.
- **Disabled State:** Surface background, Disabled text color.

---

## 5. Animations & Micro-interactions
- **Translation Pulse:** When a new word is confidently translated and spoken, the text subtly scales up (1.05x) and returns to normal over 200ms to provide visual confirmation of the audio output.
- **Skeleton Loaders:** Used exclusively during initial connection to the Python ML server.
- **Haptic Feedback:** 
  - **Success Haptic:** Triggered upon successful calibration.
  - **Warning Haptic:** Triggered if connection to the ESP32 is lost.
