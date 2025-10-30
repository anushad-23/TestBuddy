require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Models
const Alert = require('./models/Alert');
const Exam = require('./models/Exam');

// Routes
const examRoutes = require('./routes/exam');
const submissionRoutes = require('./routes/submission');
// const authRoutes = require('./routes/auth'); // Uncomment if you have it

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🚀 Starting Exam Portal Server...');

// 🔗 Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
    console.log('📊 Database: exam_portal');
  })
  .catch((error) => {
    console.log('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  });

// ✅ Create server and socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware to attach io instance to requests (useful for broadcasting)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
// app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);

// 🔐 Simple login
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

// 🩺 Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting';
  res.json({
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// === TEST INSERT ROUTE ===
const sampleSchema = new mongoose.Schema({
  name: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
});
const Sample = mongoose.model('Sample', sampleSchema, 'samples');

app.get('/api/test-insert', async (req, res) => {
  try {
    const doc = await Sample.create({ name: 'Anusha', role: 'Student' });
    console.log('✅ Document inserted:', doc);
    res.json({ message: '✅ Document inserted successfully!', doc });
  } catch (error) {
    console.error('❌ Insert failed:', error);
    res.status(500).json({ message: 'Insert failed', error: error.message });
  }
});

// === TEACHER DASHBOARD API ===
app.get('/api/teacher/dashboard', async (req, res) => {
  try {
    const totalStudents = 120; // Mocked for now
    const activeExams = await Exam.countDocuments({});
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(10);
    const avgScore = 82; // Placeholder until submissions added

    res.json({
      stats: {
        totalStudents,
        activeExams,
        alertsToday: alerts.length,
        avgScore
      },
      alerts: alerts.map(a => ({
        id: a._id,
        student: a.student,
        exam: a.exam,
        reason: a.reason,
        time: new Date(a.timestamp).toLocaleTimeString()
      })),
      exams: await Exam.find({})
    });
  } catch (err) {
    console.error('❌ Error fetching dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// === SOCKET.IO REAL-TIME CONNECTIONS ===
const teacherSocketIds = new Set();

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Register teacher or student
  socket.on('register_role', ({ role }) => {
    if (role === 'TEACHER') {
      teacherSocketIds.add(socket.id);
      console.log('👨‍🏫 Teacher registered:', socket.id);
    } else {
      console.log('🎓 Student connected:', socket.id);
    }
  });

  // 🧠 Handle tab switch detection
  socket.on('exam_tab_switch', async ({ student, examId }) => {
    console.log(`🚨 Tab switch detected! ${student} - Exam: ${examId}`);

    const payload = {
      type: 'TAB_SWITCH',
      student: student || 'Unknown',
      examId: examId || 'N/A',
      timestamp: new Date().toISOString()
    };

    // Save alert in MongoDB
    try {
      await Alert.create({
        student: student || 'Unknown',
        exam: examId || 'N/A',
        reason: 'Tab switching detected'
      });
      console.log('✅ Alert saved in MongoDB');
    } catch (err) {
      console.error('❌ Failed to save alert:', err);
    }

    // Notify all connected teachers
    teacherSocketIds.forEach((id) => {
      io.to(id).emit('teacher_alert', payload);
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    teacherSocketIds.delete(socket.id);
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
