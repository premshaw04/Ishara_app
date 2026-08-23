const { sendToMLModel } = require('../services/mlService');

module.exports = (io, socket) => {
  // Listen for continuous data from ESP32
  socket.on('esp32_raw_data', async (data) => {
    console.log('Received data from ESP32:', data);

    try {
      // 1. Send data to the ML model
      const mlResponse = await sendToMLModel(data);
      console.log('🧠 ML Prediction:', mlResponse);
      
      // 2. Broadcast the response back to the frontend (React Native)
      io.emit('ml_prediction_result', mlResponse);
      
      // 3. Parse data to broadcast raw sensor data for debugging UI
      let flex = [0,0,0,0,0];
      let pitch=0, roll=0, yaw=0;
      let gyroX=0, gyroY=0, gyroZ=0;
      let imuRaw = [0,0,0,0,0,0];

      if (typeof data === 'string') {
        const parts = data.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        if (parts.length === 11) {
          flex = parts.slice(0, 5);
          imuRaw = parts.slice(5, 11);
          [pitch, roll, yaw] = parts.slice(5, 8);
          [gyroX, gyroY, gyroZ] = parts.slice(8, 11);
        }
      } else if (data) {
        flex = Array.isArray(data.flex) ? data.flex : flex;
        pitch = data.acceleration?.x || 0;
        roll = data.acceleration?.y || 0;
        yaw = data.acceleration?.z || 0;
        gyroX = data.gyroscope?.x || data.gyro?.x || 0;
        gyroY = data.gyroscope?.y || data.gyro?.y || 0;
        gyroZ = data.gyroscope?.z || data.gyro?.z || 0;
        imuRaw = [pitch, roll, yaw, gyroX, gyroY, gyroZ];
      }

      io.emit('sensor_data', {
        payload: {
          flexSensors: flex,
          orientation: { pitch, roll, yaw },
          gyroscope: { x: gyroX, y: gyroY, z: gyroZ },
          imuRaw: imuRaw,
          battery: 100
        }
      });

    } catch (error) {
      console.error('Error processing ESP32 data:', error);
    }
  });
};
