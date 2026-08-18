import sys
import serial
import serial.tools.list_ports
import csv
import time

PORT = "COM9"          # Change to your COM port
BAUD = 115200
SAMPLES = 500

try:
    ser = serial.Serial(PORT, BAUD, timeout=2.0)  # 2-second timeout prevents indefinite freezing
except serial.SerialException as e:
    print(f"\n[ERROR] Could not open port '{PORT}': {e}")
    print("=" * 65)
    print("💡 WHY IS THIS HAPPENING?")
    print(f"On Windows, only ONE program can access '{PORT}' at a time.")
    print("PermissionError (Access is denied) means another application currently holds the port open!")
    print("\n✅ HOW TO FIX IT:")
    print("1. Close the Arduino IDE Serial Monitor or Serial Plotter.")
    print("2. Check if another terminal window or Python script is running.")
    print("3. Close any other serial tools (e.g. PlatformIO, PuTTY, CoolTerm).")
    print("4. Unplug and replug your ESP32/microcontroller USB cable if needed.\n")
    
    ports = serial.tools.list_ports.comports()
    if ports:
        print("🔌 Detected COM Ports on this PC:")
        for p in ports:
            print(f"   - {p.device}: {p.description}")
    else:
        print("🔌 No COM ports currently detected. Make sure the device is plugged in.")
    print("=" * 65 + "\n")
    sys.exit(1)

gesture = input("Enter Gesture Name : ").upper()

filename = "gestures_dataset.csv"

file = open(filename, "a", newline="")
writer = csv.writer(file)

print("\nGet Ready...")
time.sleep(3)

print("Recording Started...")
ser.reset_input_buffer()  # Flush old/partial data accumulated during sleep

count = 0
mismatch_warned = 0

while count < SAMPLES:
    try:
        raw_bytes = ser.readline()
        if not raw_bytes:
            print("⏳ [WARNING] Timeout: No incoming serial data from ESP32. Check connections and ensure ESP32 is using Serial.println().")
            time.sleep(0.5)
            continue

        line = raw_bytes.decode('utf-8', errors='ignore').strip()
        if not line:
            continue

        # Split and filter out any accidental trailing empty strings (like from a trailing comma)
        values = [v.strip() for v in line.split(",") if v.strip() != ""]

        if len(values) == 11:
            values.append(gesture)
            writer.writerow(values)
            count += 1
            print(f"Sample {count}/{SAMPLES}")
        else:
            if mismatch_warned < 5:  # Print warning so user understands why sample isn't recording
                print(f"⚠️ [MISMATCH WARNING] Expected 11 sensor values, but received {len(values)}: {values}")
                mismatch_warned += 1
                if mismatch_warned == 5:
                    print("💡 (Further column length warning messages suppressed...)")
    except KeyboardInterrupt:
        print("\n🛑 Recording paused/cancelled by user (Ctrl+C). Saving progress...")
        break
    except Exception as err:
        print(f"⚠️ [ERROR] Reading sample: {err}")

print(f"\nDataset Collection Finished! ({count} samples logged)")

file.close()
ser.close()