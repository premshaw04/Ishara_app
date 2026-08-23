import sys
import os
import json
import csv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CALIBRATION_FILE = "calibration_profile.json"
DATASET_FILE = "gestures_dataset.csv"
BACKUP_FILE = "gestures_dataset_backup.csv"

def normalize_sample(raw_values, profile):
    flex_min = profile.get("flex_min", [3000.0] * 5)
    flex_max = profile.get("flex_max", [1000.0] * 5)
    imu_offsets = profile.get("imu_offsets", [0.0] * 6)
    
    normalized = []
    
    # 1. Flex Sensors (0-4)
    for i in range(5):
        raw = raw_values[i]
        c_min = flex_min[i]
        c_max = flex_max[i]
        if c_min == c_max:
            val = 0.0
        else:
            val = (raw - c_min) / (c_max - c_min)
        # Constrain to [0.0, 1.0]
        val = max(0.0, min(1.0, val))
        normalized.append(round(val, 4))
        
    # 2. IMU Sensors (5-10)
    for i in range(6):
        raw = raw_values[5 + i]
        offset = imu_offsets[i]
        # Just subtract the zero-offset
        val = raw - offset
        normalized.append(round(val, 2))
        
    return normalized

def main():
    if not os.path.exists(CALIBRATION_FILE):
        print(f"❌ [ERROR] '{CALIBRATION_FILE}' not found! Cannot normalize dataset.")
        return

    if not os.path.exists(DATASET_FILE):
        print(f"❌ [ERROR] '{DATASET_FILE}' not found!")
        return

    # Load calibration profile
    with open(CALIBRATION_FILE, "r") as f:
        profile = json.load(f)
        
    print("✅ Loaded calibration profile.")
    
    # Backup original file
    if not os.path.exists(BACKUP_FILE):
        import shutil
        shutil.copy2(DATASET_FILE, BACKUP_FILE)
        print(f"✅ Backed up original dataset to '{BACKUP_FILE}'.")
    else:
        print(f"ℹ️ Backup already exists at '{BACKUP_FILE}', skipping backup.")

    print(f"🔄 Normalizing '{DATASET_FILE}'... This may take a moment.")
    
    # Read all lines from the backup file (to ensure we process the raw data)
    rows = []
    with open(BACKUP_FILE, "r", newline='') as infile:
        reader = csv.reader(infile)
        header = next(reader, None)
        
        for row in reader:
            if len(row) != 12:
                continue # Skip malformed rows
            try:
                # Parse the 11 sensor values
                raw_values = [float(v) for v in row[:11]]
                gesture = row[11]
                
                # Normalize
                normalized_values = normalize_sample(raw_values, profile)
                
                # Append back gesture
                rows.append(normalized_values + [gesture])
            except ValueError:
                continue # Skip rows with non-numeric data

    # Write back to dataset file
    with open(DATASET_FILE, "w", newline='') as outfile:
        writer = csv.writer(outfile)
        if header:
            writer.writerow(header)
        writer.writerows(rows)
        
    print(f"🎉 SUCCESS! Normalized {len(rows)} samples and saved to '{DATASET_FILE}'.")
    print("👉 You should now run 'python train_model.py' to retrain your ML model on this normalized data!")

if __name__ == "__main__":
    main()
