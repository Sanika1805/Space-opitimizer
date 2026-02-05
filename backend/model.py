import joblib
import numpy as np

FEATURES = [
    "AQI",
    "PM2_5",
    "PM10",
    "BOD",
    "waste_tons_per_day",
    "green_cover_percent",
    "population_density"
]

model = joblib.load("model.pkl")

def predict_priority(data: dict):
    values = np.array([[data[f] for f in FEATURES]])
    score = model.predict(values)[0]

    if score >= 75:
        label = "High"
    elif score >= 45:
        label = "Medium"
    else:
        label = "Low"

    return {
        "priority_score": float(score),
        "priority_label": label
    }


# import joblib
# import numpy as np

# model = joblib.load("model.pkl")

# def predict_priority(data):
#     return {"test": "ok"}
