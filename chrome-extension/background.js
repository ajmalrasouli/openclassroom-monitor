let ws = null;
let studentId = null;

// Initialize WebSocket connection
function initializeWebSocket() {
    ws = new WebSocket('ws://localhost:3001');
    
    ws.onopen = () => {
        chrome.storage.local.get(['studentId', 'studentName'], (data) => {
            if (data.studentId) {
                ws.send(JSON.stringify({
                    type: 'IDENTIFY',
                    clientType: 'student',
                    id: data.studentId,
                    name: data.studentName
                }));
            }
        });
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
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
    };
}

// Screen capture functionality
function captureScreen() {
    chrome.desktopCapture.chooseDesktopMedia(
        ['screen', 'window', 'tab'],
        (streamId) => {
            if (streamId) {
                // Send screen data to server
                ws.send(JSON.stringify({
                    type: 'SCREEN_DATA',
                    screenData: streamId
                }));
            }
        }
    );
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
