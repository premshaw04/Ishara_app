let isOffline = false;
let lastErrorLogTime = 0;

async function sendToMLModel(data) {
  try {
    const mlUrl = process.env.ML_MODEL_URL || 'http://127.0.0.1:8000/predict-array';

    // If currently marked offline, wait before attempting another network request (3-second cooldown)
    const now = Date.now();
    if (isOffline && (now - lastErrorLogTime < 3000)) {
      return { prediction: "ML Offline", confidence: 0 };
    }
    
    // Normalize incoming data into FastAPI's required { "values": [11 items] } format
    let payload = data;
    if (typeof data === 'string') {
      const parts = data.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      payload = { values: parts };
    } else if (Array.isArray(data)) {
      payload = { values: data };
    } else if (data && data.flex && !data.values) {
      const f = Array.isArray(data.flex) ? data.flex : [0,0,0,0,0];
      const a = data.acceleration || { x: 0, y: 0, z: 0 };
      const g = data.gyroscope || data.gyro || { x: 0, y: 0, z: 0 };
      payload = {
        values: [
          ...f,
          a.x ?? 0, a.y ?? 0, a.z ?? 0,
          g.x ?? 0, g.y ?? 0, g.z ?? 0
        ]
      };
    }

    const response = await fetch(mlUrl, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ML Service] Model returned HTTP ${response.status}: ${errText}`);
      return { prediction: "Prediction Error", confidence: 0 };
    }

    // If we were offline and now succeeded, log reconnection
    if (isOffline) {
      console.log('✅ [ML Service] Successfully connected to ML Model server.');
      isOffline = false;
    }

    return await response.json();
  } catch (error) {
    const now = Date.now();
    const isConnRefused = error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED') || error?.code === 'ECONNREFUSED';
    
    // Only log the error warning once every 10 seconds to prevent terminal flooding
    if (!isOffline || (now - lastErrorLogTime >= 10000)) {
      if (isConnRefused) {
        console.warn('⚠️  [ML Service] Cannot connect to ML Model at port 8000 (ECONNREFUSED). Is your Python ML server running? Retrying automatically in background...');
      } else {
        console.error('[ML Service] Error communicating with ML Model:', error?.message || error);
      }
      lastErrorLogTime = now;
      isOffline = true;
    }

    return { prediction: "ML Offline", confidence: 0 };
  }
}

module.exports = {
  sendToMLModel
};

