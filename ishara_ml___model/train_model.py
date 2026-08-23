import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)

# =====================================
# Configuration
# =====================================

DATASET_PATH = "gestures_dataset.csv"
MODEL_DIR = "models"

os.makedirs(MODEL_DIR, exist_ok=True)

# =====================================
# Load Dataset
# =====================================

print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Total Samples : {len(df)}")
print(f"Total Gestures: {df['gesture'].nunique()}")

# Remove missing values if any
df = df.dropna()

# =====================================
# Features & Labels
# =====================================

X = df[["Thumb", "Index", "Middle", "Ring", "Pinky","AccX","AccY","AccZ","GyroX","GyroY","GyroZ"]]

y = df["gesture"]

# =====================================
# Encode Labels
# =====================================

label_encoder = LabelEncoder()

y_encoded = label_encoder.fit_transform(y)

print("\nGesture Classes:")
for index, label in enumerate(label_encoder.classes_):
    print(f"{index} -> {label}")

# =====================================
# Train/Test Split
# =====================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.20,
    random_state=42,
    stratify=y_encoded
)

print("\nTraining Samples :", len(X_train))
print("Testing Samples  :", len(X_test))

# =====================================
# Random Forest Model
# =====================================

model = RandomForestClassifier(
    n_estimators=300,
    criterion="gini",
    max_depth=10,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1
)

print("\nTraining Random Forest...")

model.fit(X_train, y_train)

# =====================================
# Prediction
# =====================================

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nModel Accuracy : {:.2f}%".format(accuracy * 100))

print("\nClassification Report\n")

print(
    classification_report(
        y_test,
        predictions,
        target_names=label_encoder.classes_
    )
)

# =====================================
# Confusion Matrix
# =====================================

cm = confusion_matrix(y_test, predictions)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=label_encoder.classes_
)

disp.plot(xticks_rotation=45)
plt.title("Gesture Confusion Matrix")
plt.tight_layout()
# plt.show()


# =====================================
# Feature Importance
# =====================================

print("\nFeature Importance\n")

feature_names = X.columns

for feature, importance in zip(feature_names, model.feature_importances_):
    print(f"{feature:10s}: {importance:.4f}")

# =====================================
# Save Model
# =====================================

joblib.dump(model, os.path.join(MODEL_DIR, "gesture_model.pkl"))
joblib.dump(label_encoder, os.path.join(MODEL_DIR, "label_encoder.pkl"))

print("\nModel Saved Successfully!")