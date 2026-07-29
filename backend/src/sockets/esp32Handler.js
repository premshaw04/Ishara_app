const { sendToMLModel } = require('../services/mlService');

module.exports = (io, socket) => {
  // Listen for continuous data from ESP32
  socket.on('esp32_raw_data', async (data) => {
    console.log('Received data from ESP32:', data);

    try {
      // 1. Send data to the ML model
      const mlResponse = await sendToMLModel(data);
      
      // 2. Broadcast the response back to the frontend (React Native)
      io.emit('ml_prediction_result', mlResponse);
      
      // 3. Broadcast raw sensor data for debugging UI
      io.emit('sensor_data', {
        payload: {
          flexSensors: data.flex || [0,0,0,0,0],
          orientation: { pitch: data.acceleration?.x || 0, roll: data.acceleration?.y || 0, yaw: data.acceleration?.z || 0 },
          battery: 100
        }
      });

    } catch (error) {
      console.error('Error processing ESP32 data:', error);
    }
  });
};
