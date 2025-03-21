const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
    console.log('New client connected');
    
    // Handle client identification
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch(data.type) {
            case 'IDENTIFY':
                // Store client info (student or teacher)
                clients.set(ws, {
                    type: data.clientType,
                    id: data.id,
                    name: data.name
                });
                broadcastConnectedClients();
                break;
                
            case 'SCREEN_DATA':
                // Forward screen data to teacher
                broadcastToTeachers({
                    type: 'SCREEN_UPDATE',
                    studentId: clients.get(ws).id,
                    screenData: data.screenData
                });
                break;
                
            case 'MESSAGE':
                // Handle messages between teacher and students
                if (data.to === 'all') {
                    broadcastToStudents(data);
                } else {
                    sendToSpecificClient(data.to, data);
                }
                break;
                
            case 'BLOCK_SITES':
                // Broadcast blocked sites update to students
                broadcastToStudents({
                    type: 'UPDATE_BLOCKED_SITES',
                    sites: data.sites
                });
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        broadcastConnectedClients();
    });
});

function broadcastConnectedClients() {
    const clientList = Array.from(clients.values())
        .map(client => ({
            type: client.type,
            id: client.id,
            name: client.name
        }));
        
    broadcast({
        type: 'CLIENT_LIST',
        clients: clientList
    });
}

function broadcastToTeachers(data) {
    for (const [client, info] of clients) {
        if (info.type === 'teacher') {
            client.send(JSON.stringify(data));
        }
    }
}

function broadcastToStudents(data) {
    for (const [client, info] of clients) {
        if (info.type === 'student') {
            client.send(JSON.stringify(data));
        }
    }
}

function sendToSpecificClient(clientId, data) {
    for (const [client, info] of clients) {
        if (info.id === clientId) {
            client.send(JSON.stringify(data));
            break;
        }
    }
}

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
