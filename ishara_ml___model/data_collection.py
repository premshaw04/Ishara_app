import sys
import os
import json
import time
import csv
import serial
import serial.tools.list_ports

PORT = "COM9"          # Change to your COM port or select interactively
BAUD = 115200
SAMPLES = 500
CALIBRATION_FILE = "calibration_profile.json"
DATASET_FILE = "gestures_dataset.csv"
FINGER_NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"]


def find_serial_port(default_port=PORT):
    """Attempt to connect to default_port or prompt user to select from active ports."""
    ports = serial.tools.list_ports.comports()
    if not ports:
        print("\n❌ [ERROR] No COM ports detected! Please connect your ESP32 / Arduino.")
        sys.exit(1)

    available_devices = [p.device for p in ports]
    selected_port = default_port if default_port in available_devices else available_devices[0]

    try:
        ser = serial.Serial(selected_port, BAUD, timeout=2.0)
        print(f"✅ Connected to {selected_port} @ {BAUD} baud.")
        return ser
    except serial.SerialException as e:
        print(f"\n❌ [ERROR] Could not open port '{selected_port}': {e}")
        print("=" * 65)
        print("💡 TROUBLESHOOTING:")
        print("1. Close the Arduino IDE Serial Monitor / Serial Plotter.")
        print("2. Check if another Python script or terminal holds the COM port.")
        print("3. Unplug and replug your ESP32 USB cable.")
        print("=" * 65)
        print("🔌 Available Ports:")
        for idx, p in enumerate(ports):
            print(f"   [{idx + 1}] {p.device}: {p.description}")
        print("=" * 65)
        sys.exit(1)


def read_valid_sample(ser):
    """Read a single line from serial and parse exactly 11 numeric sensor values."""
    raw_bytes = ser.readline()
    if not raw_bytes:
        return None
    line = raw_bytes.decode('utf-8', errors='ignore').strip()
    if not line:
        return None
    
    parts = [p.strip() for p in line.split(',') if p.strip() != '']
    if len(parts) != 11:
        return None
    
    try:
        return [float(v) for v in parts]
    except ValueError:
        return None


def sample_duration(ser, duration_sec=3.0, prompt_text=""):
    """Collect valid sensor samples over a specified duration and return them."""
    print(f"\n👉 {prompt_text}")
    print(f"   Starting in 2 seconds...")
    time.sleep(2)
    ser.reset_input_buffer()

    samples = []
    start_time = time.time()
    last_print = 0

    while (time.time() - start_time) < duration_sec:
        remaining = int(duration_sec - (time.time() - start_time) + 1)
        if remaining != last_print:
            print(f"   ⏱️ Sampling... {remaining}s remaining ({len(samples)} samples collected)")
            last_print = remaining

        vals = read_valid_sample(ser)
        if vals:
            samples.append(vals)

    print(f"   ✅ Done! Collected {len(samples)} samples.")
    return samples


def perform_calibration(ser):
    """Run a 3-step interactive calibration wizard for IMU and Flex sensors."""
    print("\n" + "=" * 65)
    print("🎯 SMART GLOVE CALIBRATION WIZARD")
    print("=" * 65)
    print("We will calibrate your glove in 3 simple steps:")
    print("  1. IMU Zero-Offset (Glove flat & still on desk)")
    print("  2. Open Hand (All 5 fingers straight/flat)")
    print("  3. Closed Fist (All 5 fingers tightly bent)")
    print("=" * 65)

    input("\nPress [ENTER] when ready to begin Step 1...")

    # Step 1: IMU Rest Position
    imu_samples = sample_duration(
        ser, 
        duration_sec=3.0, 
        prompt_text="STEP 1: Keep the glove FLAT and COMPLETELY STILL on a table."
    )
    if not imu_samples:
        print("⚠️ Warning: No samples received during IMU step. Using fallback offsets.")
        imu_offsets = [0.0] * 6
    else:
        # Indices 5..10 correspond to AccX, AccY, AccZ, GyroX, GyroY, GyroZ
        sums = [0.0] * 6
        for s in imu_samples:
            for i in range(6):
                sums[i] += s[5 + i]
        imu_offsets = [round(val / len(imu_samples), 2) for val in sums]

    # Step 2: Open Hand (Flex Min)
    input("\nPress [ENTER] when ready for Step 2 (Open Hand)...")
    open_samples = sample_duration(
        ser, 
        duration_sec=3.0, 
        prompt_text="STEP 2: OPEN your hand completely flat (all 5 fingers straight)."
    )
    if not open_samples:
        print("⚠️ Warning: No samples received. Using default min.")
        flex_min = [3000.0] * 5
    else:
        sums = [0.0] * 5
        for s in open_samples:
            for i in range(5):
                sums[i] += s[i]
        flex_min = [round(val / len(open_samples), 1) for val in sums]

    # Step 3: Closed Fist (Flex Max)
    input("\nPress [ENTER] when ready for Step 3 (Closed Fist)...")
    fist_samples = sample_duration(
        ser, 
        duration_sec=3.0, 
        prompt_text="STEP 3: Make a tight FIST (curl all 5 fingers tightly)."
    )
    if not fist_samples:
        print("⚠️ Warning: No samples received. Using default max.")
        flex_max = [1000.0] * 5
    else:
        sums = [0.0] * 5
        for s in fist_samples:
            for i in range(5):
                sums[i] += s[i]
        flex_max = [round(val / len(fist_samples), 1) for val in sums]

    # Build profile
    profile = {
        "flex_min": flex_min,
        "flex_max": flex_max,
        "imu_offsets": imu_offsets,
        "calibrated_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Save profile to JSON
    with open(CALIBRATION_FILE, "w") as f:
        json.dump(profile, f, indent=4)

    print("\n" + "=" * 65)
    print("✅ CALIBRATION COMPLETE! Summary:")
    print("=" * 65)
    print(" Finger      | Open Hand (Min) | Fist (Max)")
    print("-------------+-----------------+------------")
    for idx, name in enumerate(FINGER_NAMES):
        print(f" {name:11} | {flex_min[idx]:<15} | {flex_max[idx]:<10}")
    print(f"\nSaved profile to '{CALIBRATION_FILE}'")
    print("=" * 65)

    return profile


def load_calibration():
    """Load existing calibration profile if present."""
    if os.path.exists(CALIBRATION_FILE):
        try:
            with open(CALIBRATION_FILE, "r") as f:
                profile = json.load(f)
                return profile
        except Exception:
            pass
    return None


def main():
    ser = find_serial_port(PORT)

    # Calibration Selection
    saved_profile = load_calibration()

    print("\n" + "=" * 65)
    print("🛠️ CALIBRATION SETUP")
    print("=" * 65)
    if saved_profile:
        print(f"📁 Found saved calibration from: {saved_profile.get('calibrated_at', 'Unknown')}")
        print("   [1] Run New Calibration Wizard (Recommended)")
        print("   [2] Use Saved Calibration Profile")
        print("   [3] Skip Calibration")
        choice = input("Select an option [1/2/3] (default 1): ").strip()
        if choice == "2":
            print("✅ Using saved calibration profile.")
        elif choice == "3":
            print("⏩ Skipping calibration.")
        else:
            perform_calibration(ser)
    else:
        print("ℹ️ No previous calibration profile found.")
        choice = input("Would you like to run the Calibration Wizard now? [Y/n]: ").strip().lower()
        if choice != "n":
            perform_calibration(ser)
        else:
            print("⏩ Proceeding without calibration.")

    # Data collection parameters
    print("\n" + "=" * 65)
    print("📝 DATASET RECORDING")
    print("=" * 65)
    gesture = input("Enter Gesture Name (e.g. HELLO, THANK YOU, YES): ").strip().upper()
    if not gesture:
        gesture = "UNKNOWN"

    # Check if dataset file needs header
    file_exists = os.path.exists(DATASET_FILE)
    is_empty = file_exists and os.path.getsize(DATASET_FILE) == 0

    file = open(DATASET_FILE, "a", newline="")
    writer = csv.writer(file)

    if not file_exists or is_empty:
        writer.writerow(["Thumb", "Index", "Middle", "Ring", "Pinky", "AccX", "AccY", "AccZ", "GyroX", "GyroY", "GyroZ", "gesture"])

    print(f"\n🎯 Target: Recording {SAMPLES} samples for gesture '{gesture}'...")
    print("Get ready! Starting in 3 seconds...")
    time.sleep(3)

    ser.reset_input_buffer()
    print("🔴 RECORDING STARTED... (Press Ctrl+C to stop and save early)\n")

    count = 0

    while count < SAMPLES:
        try:
            values = read_valid_sample(ser)
            if values is None:
                continue

            row = values + [gesture]
            writer.writerow(row)
            count += 1

            if count % 25 == 0 or count == SAMPLES:
                progress = int((count / SAMPLES) * 30)
                bar = "█" * progress + "-" * (30 - progress)
                print(f" [{bar}] Sample {count}/{SAMPLES} ({(count/SAMPLES)*100:.1f}%)")

        except KeyboardInterrupt:
            print(f"\n🛑 Recording paused/stopped by user (Ctrl+C).")
            break
        except Exception as err:
            print(f"⚠️ [ERROR] Reading sample: {err}")

    file.close()
    ser.close()

    print("\n" + "=" * 65)
    print(f"🎉 SUCCESS: Recorded {count} samples for '{gesture}' in '{DATASET_FILE}'!")
    print("=" * 65)


if __name__ == "__main__":
    main()