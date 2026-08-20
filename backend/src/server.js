require('dotenv').config({ override: true });
const express = require('express');
const http = require('http');
const cors = require('cors');
const setupSockets = require('./sockets/index');

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/profile', require('./routes/profileRoutes'));
app.use('/history', require('./routes/historyRoutes'));

// Initialize Socket.io
setupSockets(server);

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Backend Server is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Trigger restart 2
