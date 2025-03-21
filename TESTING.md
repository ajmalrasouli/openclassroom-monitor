# Testing Guide for OpenClassroom Monitor

## 🚀 Setup Testing Environment

### 1. Start the Backend Server
```bash
cd backend
npm install
npm start
```
Expected output: "Server running on port 3001"

### 2. Start the Frontend (Teacher Dashboard)
```bash
cd frontend
npm install
npm start
```
Expected output: React development server starting on port 3000

### 3. Load the Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right corner)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory
5. Verify the extension icon appears in Chrome's toolbar

## 🧪 Testing Scenarios

### 1. Test Teacher Dashboard
1. Open `http://localhost:3000` in your browser
2. Verify the dashboard loads with:
   - Empty student grid
   - Top navigation bar
   - Website blocking controls
   - Messaging interface

### 2. Test Student Extension
1. Open a new Chrome window
2. Click the extension icon
3. Enter student information
4. Verify connection status shows "Connected"

### 3. Test Core Features

#### Screen Monitoring
1. With both teacher and student connected:
   - Teacher should see student's screen preview
   - Screen updates should be real-time
   - Multiple students should appear in grid layout

#### Website Blocking
1. From teacher dashboard:
   - Add a website to block (e.g., "facebook.com")
   - Verify student receives blocking notification
   - Test blocked website access on student browser

#### Messaging System
1. Teacher to Student:
   - Send message from dashboard
   - Verify student receives notification
2. Student to Teacher:
   - Send message from extension
   - Verify message appears on dashboard

#### Attendance Tracking
1. Monitor student connections:
   - Connect multiple student instances
   - Close student browser
   - Verify status updates on dashboard

## 🐛 Troubleshooting

### Common Issues
1. WebSocket Connection Failed
   - Verify backend server is running
   - Check correct WebSocket URL in frontend/extension
   - Ensure no firewall blocking

2. Extension Not Loading
   - Verify manifest.json syntax
   - Check Chrome console for errors
   - Reload extension

3. Screen Sharing Issues
   - Ensure proper permissions granted
   - Check Chrome screen capture settings
   - Verify WebRTC configuration

## ✅ Test Completion Checklist

- [ ] Backend server running successfully
- [ ] Frontend dashboard accessible
- [ ] Chrome extension loaded
- [ ] WebSocket connections established
- [ ] Screen monitoring functional
- [ ] Website blocking working
- [ ] Messaging system operational
- [ ] Attendance tracking accurate

## 📝 Reporting Issues

When reporting issues, please include:
1. Component affected (Backend/Frontend/Extension)
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser console logs
5. Server logs
