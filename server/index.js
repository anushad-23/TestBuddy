require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🚀 Starting Exam Portal Server...');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas!');
  console.log('📊 Database: exam_portal');
})
.catch((error) => {
  console.log('❌ MongoDB Connection Failed:', error.message);
  process.exit(1);
});

// Simple login
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body || {};
  const isTeacher = (username || '').toLowerCase().includes('teacher');
  console.log(`🔐 Login: ${username} -> ${isTeacher ? 'TEACHER' : 'STUDENT'}`);
  res.json({ 
    token: 'demo-token', 
    role: isTeacher ? 'TEACHER' : 'STUDENT', 
    username 
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting';
  res.json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const teacherSocketIds = new Set();

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('register_role', ({ role }) => {
    if (role === 'TEACHER') {
      teacherSocketIds.add(socket.id);
      console.log('👨‍🏫 Teacher registered:', socket.id);
    }
  });

  socket.on('exam_tab_switch', ({ student, examId }) => {
    console.log('🚨 Tab switch:', student, 'in exam:', examId);
    const payload = {
      type: 'TAB_SWITCH',
      student: student || 'Unknown Student',
      examId: examId || 'unknown',
      timestamp: new Date().toISOString()
    };
    teacherSocketIds.forEach((id) => {
      io.to(id).emit('teacher_alert', payload);
    });
  });

  socket.on('disconnect', () => {
    teacherSocketIds.delete(socket.id);
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// CHANGED PORT FROM 8080 TO 8081
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});