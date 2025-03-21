# OpenClassroom Monitor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview
OpenClassroom Monitor is a powerful classroom management tool that allows teachers to monitor and control student Chromebooks in real-time. With features like screen monitoring, website blocking, and instant messaging, teachers can maintain an effective learning environment.

## Features
- Real-time screen monitoring
- Website blocking
- Instant messaging between teacher and students
- Screen recording capabilities
- Attendance tracking
- Google Sign-In authentication
- Student activity monitoring

## Technical Stack
- **Backend**: Node.js with WebSocket server
- **Frontend**: React.js with Material-UI
- **Chrome Extension**: Chrome Extension Manifest V3
- **Authentication**: Google OAuth 2.0

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Chrome browser

### Installation

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd openclassroom-monitor
```

2. **Set up the backend**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

3. **Set up the frontend**
```bash
cd frontend
npm install
npm start
```

4. **Install the Chrome extension**
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `chrome-extension` directory

### Configuration
1. Create a Google Cloud Project and obtain OAuth 2.0 credentials
2. Update the `.env` file with your Google credentials
3. Configure the WebSocket server URL in both frontend and extension

## Usage
1. Teachers log in through the dashboard using their Google account
2. Students install the Chrome extension and enter their information
3. Teachers can:
   - View student screens in real-time
   - Block distracting websites
   - Send messages to students
   - Monitor attendance
   - Record screens when needed

## Security
- All communications are secured through WebSocket
- Google OAuth 2.0 authentication
- Student data is not stored permanently
- Screen sharing requires explicit permission

## Contributing
Contributions are welcome! Please feel free to submit pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support or questions, please open an issue in the repository.
