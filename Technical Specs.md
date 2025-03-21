# OpenClassroom Monitor

## 📌 Overview
Open-source classroom monitoring software for Chromebooks. Teachers can view student screens, send messages, and block websites.

## 📂 Project Structure
```
📂 openclassroom-monitor
├── 📂 chrome-extension/      # Chrome extension for student monitoring
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
├── 📂 backend/               # Node.js backend with WebSockets
│   ├── server.js
│   ├── package.json
│   ├── .env.example
├── 📂 frontend/              # React.js teacher dashboard
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
├── README.md                 # Documentation
├── LICENSE                   # Open-source license
```

## 🚀 Deployment Instructions

### 1️⃣ Install Dependencies
```sh
cd backend
npm install
```

### 2️⃣ Run the Backend
```sh
node server.js
```

### 3️⃣ Start the Frontend (React.js)
```sh
cd frontend
npm install
npm start
```

### 4️⃣ Load Chrome Extension
1. Open **chrome://extensions/**
2. Enable **Developer Mode** (top-right corner)
3. Click **Load Unpacked**
4. Select the `chrome-extension` folder

## ✨ Features
- ✅ **View students' Chromebook screens**
- ✅ **Send messages to students**
- ✅ **Block websites remotely**
- ✅ **Record student screens**
- ✅ **Track student attendance**
- ✅ **User authentication with Google Sign-In**
- ✅ **Real-time student tracking**
- ✅ **Student activity logs**
- ✅ **Improved UI for teacher dashboard**

## 🔧 Additional Features

### 🔹 Messaging Students
**Backend Update (server.js):**
```js
wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received: ${message}`);
        if (message.startsWith('MSG:')) {
            wss.clients.forEach(client => client.send(message));
        }
    });
});
```

### 🔹 Blocking Websites
**Chrome Extension Update (content.js):**
```js
const blockedSites = ['facebook.com', 'youtube.com'];
setInterval(() => {
    if (blockedSites.some(site => window.location.href.includes(site))) {
        document.body.innerHTML = '<h1>Blocked by Teacher</h1>';
    }
}, 1000);
```

### 🔹 Screen Recording
**Chrome Extension Update (background.js):**
```js
chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], streamId => {
    console.log("Screen Recording Started: " + streamId);
});
```

### 🔹 Attendance Tracking
**Backend Update (server.js):**
```js
const studentsOnline = new Set();
wss.on('connection', ws => {
    ws.on('message', message => {
        if (message.startsWith('ATTENDANCE:')) {
            studentsOnline.add(message.split(':')[1]);
        }
    });
});
```

### 🔹 Google Sign-In Authentication
**Frontend Update (React - App.js):**
```js
import { GoogleLogin } from 'react-google-login';

function Login() {
    const responseGoogle = (response) => {
        console.log(response);
    };

    return <GoogleLogin clientId="YOUR_GOOGLE_CLIENT_ID" buttonText="Login with Google" onSuccess={responseGoogle} onFailure={responseGoogle} cookiePolicy={'single_host_origin'} />;
}
```

### 🔹 Real-time Student Tracking
**Backend Update (server.js):**
```js
const studentStatus = {};
wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    studentStatus[ip] = 'online';
    ws.on('close', () => studentStatus[ip] = 'offline');
});
```

### 🔹 Student Activity Logs
**Backend Update (server.js):**
```js
const activityLogs = [];
wss.on('connection', ws => {
    ws.on('message', message => {
        activityLogs.push({ timestamp: Date.now(), data: message });
    });
});
```

## 📝 Next Steps
- Enhance UI with real-time dashboards
- Add role-based permissions
- Implement session history tracking
- Improve data visualization for student logs

## 📚 License
Open-source license

