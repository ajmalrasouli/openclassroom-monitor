import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Dialog,
  TextField,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Block,
  Message,
  Refresh,
  Settings,
  Computer,
  CheckCircle,
  Warning,
  Fullscreen
} from '@mui/icons-material';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [blockedSites, setBlockedSites] = useState([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [fullscreenView, setFullscreenView] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://10.129.221.171:3001');

    socket.onopen = () => {
      console.log('Connected to server');
      socket.send(JSON.stringify({
        type: 'IDENTIFY',
        clientType: 'teacher',
        id: 'teacher_' + Math.random().toString(36).substr(2, 9),
        name: 'Teacher'
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'CLIENT_LIST':
          setStudents(data.clients.filter(client => client.type === 'student'));
          break;
        case 'SCREEN_UPDATE':
          updateStudentScreen(data.studentId, data.screenData);
          break;
        default:
          break;
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const updateStudentScreen = (studentId, screenData) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, screenData, lastUpdate: Date.now() }
          : student
      )
    );
  };

  const handleBlockSite = () => {
    const site = prompt('Enter website to block (e.g., facebook.com):');
    if (site) {
      const newBlockedSites = [...blockedSites, site];
      setBlockedSites(newBlockedSites);
      ws.send(JSON.stringify({
        type: 'BLOCK_SITES',
        sites: newBlockedSites
      }));
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      ws.send(JSON.stringify({
        type: 'MESSAGE',
        to: selectedStudent ? selectedStudent.id : 'all',
        content: message
      }));
      setMessage('');
      setMessageDialogOpen(false);
    }
  };

  const getStudentStatus = (student) => {
    const lastUpdate = student.lastUpdate || 0;
    const timeSinceUpdate = Date.now() - lastUpdate;
    
    if (timeSinceUpdate < 10000) { // Less than 10 seconds
      return { color: 'success', text: 'Active' };
    } else if (timeSinceUpdate < 30000) { // Less than 30 seconds
      return { color: 'warning', text: 'Idle' };
    } else {
      return { color: 'error', text: 'Inactive' };
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            OpenClassroom Monitor
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {students.length} Students Connected
          </Typography>
          <IconButton color="inherit" onClick={() => setMessageDialogOpen(true)}>
            <Message />
          </IconButton>
          <IconButton color="inherit" onClick={handleBlockSite}>
            <Block />
          </IconButton>
          <IconButton color="inherit">
            <Settings />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {students.map((student) => {
            const status = getStudentStatus(student);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
                <Card sx={{ position: 'relative' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 180,
                      backgroundColor: 'grey.200',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onClick={() => setFullscreenView(student)}
                  >
                    {student.screenData ? (
                      <img
                        src={student.screenData}
                        alt="Student Screen"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Computer sx={{ fontSize: 48, color: 'grey.400' }} />
                      </Box>
                    )}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        backgroundColor: 'rgba(0,0,0,0.5)'
                      }}
                      onClick={() => setFullscreenView(student)}
                    >
                      <Fullscreen sx={{ color: 'white' }} />
                    </IconButton>
                  </CardMedia>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
                        {student.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={status.text}
                        color={status.color}
                        icon={status.color === 'success' ? <CheckCircle /> : <Warning />}
                      />
                    </Stack>
                    {student.deviceInfo && (
                      <Typography variant="body2" color="text.secondary">
                        Device: {student.deviceInfo.deviceName}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Dialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
      >
        <Box sx={{ p: 2, width: 400 }}>
          <Typography variant="h6" gutterBottom>
            Send Message
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            fullWidth
          >
            Send
          </Button>
        </Box>
      </Dialog>

      <Dialog
        fullScreen
        open={Boolean(fullscreenView)}
        onClose={() => setFullscreenView(null)}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant="h6">
              {fullscreenView?.name}'s Screen
            </Typography>
            <Button color="inherit" onClick={() => setFullscreenView(null)}>
              Close
            </Button>
          </Toolbar>
        </AppBar>
        {fullscreenView?.screenData && (
          <Box
            sx={{
              width: '100%',
              height: 'calc(100vh - 64px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'black'
            }}
          >
            <img
              src={fullscreenView.screenData}
              alt="Full Screen View"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default Dashboard;
