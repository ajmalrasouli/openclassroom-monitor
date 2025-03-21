const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const googleAdminService = require('./services/googleAdmin');

dotenv.config();

const app = express();
app.use(cors({
  origin: '*', // Allow all origins during testing
  methods: ['GET', 'POST']
}));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Test endpoint for Google Admin integration
app.get('/api/test-admin', async (req, res) => {
    try {
        // Load credentials from the file specified in GOOGLE_APPLICATION_CREDENTIALS
        const credentialsPath = path.join(__dirname, 'config', 'google-credentials.json');
        console.log('Loading credentials from:', credentialsPath);
        const credentials = require(credentialsPath);
        
        // Initialize Google Admin service
        await googleAdminService.initialize(credentials);
        
        // Try to fetch devices from the specified OU
        const devices = await googleAdminService.getDevicesFromOU(process.env.ORG_UNIT_PATH);
        
        res.json({
            success: true,
            message: 'Google Admin integration test successful',
            deviceCount: devices.length,
            devices: devices
        });
    } catch (error) {
        console.error('Google Admin test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.stack
        });
    }
});

wss.on('connection', (ws, req) => {
    console.log('New client connected from:', req.socket.remoteAddress);
    
    let clientId = null;
    let clientType = null;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'IDENTIFY':
                    clientId = data.id;
                    clientType = data.clientType;
                    clients.set(ws, {
                        type: clientType,
                        id: clientId,
                        name: data.name,
                        deviceInfo: data.deviceInfo
                    });
                    
                    // If it's a student with device info, try to match with Google Admin
                    if (clientType === 'student' && data.deviceInfo) {
                        try {
                            const deviceDetails = await googleAdminService.matchDeviceToStudent(data.deviceInfo.macAddress);
                            if (deviceDetails) {
                                clients.get(ws).deviceDetails = deviceDetails;
                            }
                        } catch (error) {
                            console.error('Error matching device:', error);
                        }
                    }
                    
                    // Broadcast updated client list
                    broadcastConnectedClients();
                    break;
                    
                case 'SCREEN_DATA':
                    if (clientId) {
                        broadcastToTeachers({
                            type: 'SCREEN_UPDATE',
                            studentId: clients.get(ws).id,
                            screenData: data.screenData
                        });
                    }
                    break;
                    
                case 'BLOCK_SITES':
                    broadcastToStudents({
                        type: 'UPDATE_BLOCKED_SITES',
                        sites: data.sites
                    });
                    break;
                    
                case 'MESSAGE':
                    if (data.to === 'all') {
                        broadcastToStudents({
                            type: 'MESSAGE',
                            from: clientId,
                            content: data.content
                        });
                    } else {
                        sendToSpecificClient(data.to, {
                            type: 'MESSAGE',
                            from: clientId,
                            content: data.content
                        });
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected:', clients.get(ws)?.name);
        clients.delete(ws);
        broadcastConnectedClients();
    });
});

function broadcastConnectedClients() {
    const clientList = Array.from(clients.values())
        .map(client => ({
            type: client.type,
            id: client.id,
            name: client.name,
            deviceInfo: client.deviceInfo,
            deviceDetails: client.deviceDetails
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
const HOST = '0.0.0.0'; // Listen on all network interfaces
server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
