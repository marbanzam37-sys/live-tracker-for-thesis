const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to let the server read JSON data sent by the ESP32
app.use(express.json());

// Serve your frontend map from the 'public' folder
app.use(express.static('public'));

// 1. The Route where your ESP32 pushes GPS coordinates
app.post('/update', (req, res) => {
    const { lat, lon } = req.body;
    console.log(`Received GPS -> Lat: ${lat}, Lon: ${lon}`);

    // Broadcast the new coordinates live to the browser map via WebSockets
    io.emit('location-update', { lat, lon });

    res.status(200).send({ status: 'Coordinates received' });
});

// 2. The Route where your ESP32 kill-switch sends the terminate signal
app.post('/terminate', (req, res) => {
    console.log('Terminate signal received from hardware.');

    // Broadcast the stop signal to the browser dashboard to turn the box green
    io.emit('tracking-stopped', { message: 'Tracking session terminated. User is safe.' });

    res.status(200).send({ status: 'Session terminated' });
});

// Socket.io connection monitor
io.on('connection', (socket) => {
    console.log('A client connected to the live map dashboard.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});
