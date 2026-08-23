#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>

// ================= CONFIGURATION =================
const char* ssid     = "realme P3 Ultra 5G CCD4";        // Enter your Wi-Fi Name
const char* password = "44444444";    // Enter your Wi-Fi Password

// IMPORTANT: Put your laptop's local IP address here (e.g., "192.168.1.15")
// You can find this by typing 'ipconfig' in your Windows command prompt
const char* server_ip = "10.87.187.36"; 
const uint16_t server_port = 5000;              // The port we set in server.js

// ================= SENSORS & SOCKET =================
SocketIOclient socketIO;
Adafruit_MPU6050 mpu;

// Define the analog pins for your 5 flex sensors (ESP32 ADC pins)
const int flexPins[5] = {32, 33, 34, 35, 36}; 

// Timer variable to prevent flooding the network
unsigned long lastTransmission = 0;
const int transmissionRate = 200; // Send data every 50 milliseconds (20 times a second)

// ================= SOCKET EVENT HANDLER =================
void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            Serial.println("[IOc] Disconnected!");
            break;
        case sIOtype_CONNECT:
            Serial.print("[IOc] Connected to url: ");
            Serial.println((char*)payload);
            // Join default namespace
            socketIO.send(sIOtype_CONNECT, "/");
            break;
    }
}

void setup() {
    Serial.begin(115200);

    // 1. Initialize Wi-Fi
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected!");
    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());

    // 2. Initialize Flex Sensor Pins
    for (int i = 0; i < 5; i++) {
        pinMode(flexPins[i], INPUT);
    }

    // 3. Initialize IMU (MPU6050)
    if (!mpu.begin()) {
        Serial.println("Failed to find MPU6050 chip. Check your wiring!");
        { delay(10); } // Stop execution if IMU fails
    }
    Serial.println("MPU6050 Found!");

    // 4. Connect to Backend via Socket.IO
    socketIO.begin(server_ip, server_port, "/socket.io/?EIO=4");
    socketIO.onEvent(socketIOEvent);
}

void loop() {
    // Keep the Socket.IO connection alive
    socketIO.loop();

    // Check if it's time to send the next batch of data
    if (millis() - lastTransmission > transmissionRate) {
        lastTransmission = millis();

        // --- A. Read & Smooth Flex Sensors ---
        int flexValues[5] = {0, 0, 0, 0, 0};
        const int numSamples = 5;
        
        // Take 5 rapid readings to calculate a clean, stable average
        for(int sample = 0; sample < numSamples; sample++) {
            for (int i = 0; i < 5; i++) {
                flexValues[i] += analogRead(flexPins[i]);
            }
            delay(5); // 5ms micro-delay between samples
        }
        
        // Divide by 5 to get the final averaged value
        for (int i = 0; i < 5; i++) {
            flexValues[i] = flexValues[i] / numSamples;
        }


                // --- B. Read IMU Data ---
        sensors_event_t a, g, temp;
        mpu.getEvent(&a, &g, &temp);

        // Convert m/s^2 back to raw 16-bit integer format (1g = 9.80665 m/s2 = 16384)
        float raw_ax = (a.acceleration.x / 9.80665) * 16384.0;
        float raw_ay = (a.acceleration.y / 9.80665) * 16384.0;
        float raw_az = (a.acceleration.z / 9.80665) * 16384.0;

        // Convert rad/s back to raw 16-bit format (1 rad/s = 57.2958 deg/s, 1 deg/s = 131)
        float raw_gx = g.gyro.x * 57.2958 * 131.0;
        float raw_gy = g.gyro.y * 57.2958 * 131.0;
        float raw_gz = g.gyro.z * 57.2958 * 131.0;

        // --- C. Build the JSON Object ---
        DynamicJsonDocument doc(1024);
        JsonArray array = doc.to<JsonArray>();
        array.add("esp32_raw_data"); 

        JsonObject data = array.createNestedObject();
        
        JsonArray flexJsonArray = data.createNestedArray("flex");
        for (int i = 0; i < 5; i++) {
            flexJsonArray.add(flexValues[i]);
        }

        // Add the converted RAW IMU Acceleration data
        JsonObject accel = data.createNestedObject("acceleration");
        accel["x"] = raw_ax;
        accel["y"] = raw_ay;
        accel["z"] = raw_az;

        // Add the converted RAW IMU Gyroscope data
        JsonObject gyro = data.createNestedObject("gyroscope");
        gyro["x"] = raw_gx;
        gyro["y"] = raw_gy;
        gyro["z"] = raw_gz;

        // --- D. Send Data to Backend ---
        String output;
        serializeJson(doc, output);
        socketIO.sendEVENT(output);

        // Optional: Print to serial monitor to see what's happening
        // Serial.println(output); 
    }
}