import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Block,
  Message,
  Refresh,
  Settings,
} from '@mui/icons-material';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [blockedSites, setBlockedSites] = useState([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');

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
          ? { ...student, screenData }
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            OpenClassroom Monitor
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
        <Grid container spacing={3}>
          {students.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {student.name}
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: '200px',
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {student.screenData ? (
                      <img
                        src={student.screenData}
                        alt="Student Screen"
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <Typography color="text.secondary">
                        Waiting for screen data...
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
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
    </Box>
  );
};

export default Dashboard;
