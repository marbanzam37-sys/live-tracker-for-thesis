const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to parse incoming data from the ESP32 POST request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static frontend files (put your index.html inside a folder named 'public')
app.use(express.static(path.join(__dirname, 'public')));

// Keep track of the latest coordinates in memory
let latestLocation = { lat: 7.7885, lon: 122.5866, device: 'thesis-device' };

// 1. ESP32 sends GPS POST requests here
app.post('/update-location', (req, res) => {
    const { lat, lon, device } = req.body;
    
    if (lat && lon) {
        latestLocation = { 
            lat: parseFloat(lat), 
            lon: parseFloat(lon), 
            device: device || 'unknown' 
        };
        
        console.log(`[GPS Received] Lat: ${lat}, Lon: ${lon} | Device: ${device}`);

        // Broadcast the new location to any open browser map instantly
        io.emit('location-update', latestLocation);

        res.status(200).send('Location updated successfully');
    } else {
        res.status(400).send('Invalid coordinates');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Tracking server running on http://localhost:${PORT}`);
});