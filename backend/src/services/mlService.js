async function sendToMLModel(data) {
  try {
    // Use environment variable if it exists, otherwise default to localhost:5000
    const mlUrl = process.env.ML_MODEL_URL || 'http://127.0.0.1:5000/predict';
    
    // 1. Send the HTTP POST request to the ML model
    const response = await fetch(mlUrl, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // 3. Wait for the ML model to reply and return it!
    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error communicating with ML Model:", error);
    return { prediction: "Error connecting to ML" };
  }
}

module.exports = {
  sendToMLModel
};
