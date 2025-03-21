let ws = null;
let studentId = null;
let screenCaptureInterval = null;

// Get device information
async function getDeviceInfo() {
    try {
        const networkInterfaces = await chrome.system.network.getNetworkInterfaces();
        return {
            macAddress: networkInterfaces[0].address,
            deviceName: chrome.runtime.getManifest().name
        };
    } catch (error) {
        console.error('Error getting device info:', error);
        return null;
    }
}

// Initialize WebSocket connection
async function initializeWebSocket() {
    ws = new WebSocket('ws://10.129.221.171:3001');
    
    ws.onopen = async () => {
        const deviceInfo = await getDeviceInfo();
        chrome.storage.local.get(['studentId', 'studentName'], (data) => {
            if (data.studentId) {
                ws.send(JSON.stringify({
                    type: 'IDENTIFY',
                    clientType: 'student',
                    id: data.studentId,
                    name: data.studentName,
                    deviceInfo: deviceInfo
                }));
            }
        });
        startScreenCapture();
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
            case 'UPDATE_BLOCKED_SITES':
                chrome.storage.local.set({ blockedSites: data.sites });
                break;
                
            case 'REQUEST_SCREEN':
                captureScreen();
                break;
        }
    };

    ws.onclose = () => {
        stopScreenCapture();
        setTimeout(initializeWebSocket, 5000);
    };
}

// Screen capture functionality with thumbnail generation
async function captureScreen() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                width: 1280,
                height: 720
            }
        });
        
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        
        // Capture frame and convert to thumbnail
        const bitmap = await imageCapture.grabFrame();
        const canvas = new OffscreenCanvas(320, 180);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(bitmap, 0, 0, 320, 180);
        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: 0.7
        });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            ws.send(JSON.stringify({
                type: 'SCREEN_DATA',
                screenData: reader.result
            }));
        };
        reader.readAsDataURL(blob);
        
        // Clean up
        track.stop();
    } catch (error) {
        console.error('Screen capture error:', error);
    }
}

// Start periodic screen capture
function startScreenCapture() {
    if (!screenCaptureInterval) {
        screenCaptureInterval = setInterval(captureScreen, 5000); // Capture every 5 seconds
    }
}

// Stop screen capture
function stopScreenCapture() {
    if (screenCaptureInterval) {
        clearInterval(screenCaptureInterval);
        screenCaptureInterval = null;
    }
}

// Initialize connection when extension loads
initializeWebSocket();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'BLOCKED_SITE_CHECK') {
        chrome.storage.local.get(['blockedSites'], (data) => {
            const isBlocked = data.blockedSites?.includes(request.url);
            sendResponse({ isBlocked });
        });
        return true;
    }
});
