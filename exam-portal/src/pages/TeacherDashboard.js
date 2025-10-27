// src/components/TeacherDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeExams: 0,
      alertsToday: 0,
      avgScore: 0
    },
    alerts: [],
    exams: []
  });

  // ✅ Connect to backend and Socket.IO
  useEffect(() => {
    const newSocket = io('http://localhost:8081');
    setSocket(newSocket);

    // Register as teacher
    newSocket.emit('register_role', { role: 'TEACHER' });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // ✅ Receive real-time tab switch alerts from students
    newSocket.on('teacher_alert', (payload) => {
      console.log('📢 Alert received:', payload);
      setDashboardData(prev => ({
        ...prev,
        alerts: [
          {
            id: Date.now(),
            student: payload.student,
            exam: payload.examId,
            reason: 'Tab switching detected',
            time: new Date(payload.timestamp).toLocaleTimeString()
          },
          ...prev.alerts
        ],
        stats: {
          ...prev.stats,
          alertsToday: prev.stats.alertsToday + 1
        }
      }));
    });

    // ✅ Fetch initial dashboard data from backend
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/teacher/dashboard');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error('❌ Error fetching teacher dashboard:', err);
      }
    };

    fetchDashboardData();

    return () => newSocket.close();
  }, []);

  const goBack = () => navigate('/');
  const navigateToCreateExam = () => navigate('/create-exam');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
        <div>
          <h1 style={styles.title}>Teacher Dashboard</h1>
          <p style={styles.subtitle}>Welcome back!</p>
        </div>
        <div style={{
          ...styles.status,
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          color: isConnected ? '#155724' : '#721c24'
        }}>
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Total Students</h3>
          <div style={styles.statValue}>{dashboardData.stats.totalStudents}</div>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Active Exams</h3>
          <div style={styles.statValue}>{dashboardData.stats.activeExams}</div>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Alerts Today</h3>
          <div style={styles.statValue}>{dashboardData.stats.alertsToday}</div>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statLabel}>Average Score</h3>
          <div style={styles.statValue}>{dashboardData.stats.avgScore}%</div>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={styles.gridContainer}>
        {/* Left column */}
        <div style={styles.column}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Create Exam</h2>
            <p style={styles.cardDescription}>Design and publish new exams for students.</p>
            <button style={styles.createButton} onClick={navigateToCreateExam}>
              Create Exam
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Active Exams</h2>
            {dashboardData.exams.length > 0 ? (
              dashboardData.exams.map((exam) => (
                <div key={exam._id} style={styles.examItem}>
                  <div style={styles.studentExam}>{exam.title}</div>
                  <div style={styles.studentCount}>{exam.studentCount || 0} students</div>
                </div>
              ))
            ) : (
              <p style={styles.emptyMsg}>No active exams yet.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={styles.column}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Alerts</h2>
            {dashboardData.alerts.length > 0 ? (
              dashboardData.alerts.slice(0, 6).map((alert) => (
                <div key={alert.id} style={styles.alertItem}>
                  <strong>{alert.student}</strong> — {alert.reason}
                  <div style={styles.alertTime}>{alert.time}</div>
                </div>
              ))
            ) : (
              <p style={styles.emptyMsg}>No alerts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', gap: '20px' },
  backButton: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
  title: { color: '#2c3e50', fontSize: '2.2rem', margin: 0 },
  subtitle: { color: '#7f8c8d', fontSize: '1rem' },
  status: { padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '500', minWidth: '140px', textAlign: 'center' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { backgroundColor: 'white', borderRadius: '10px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  statLabel: { color: '#6c757d', fontSize: '0.9rem', marginBottom: '8px' },
  statValue: { color: '#2c3e50', fontSize: '2.2rem', fontWeight: '700' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  column: { display: 'flex', flexDirection: 'column', gap: '25px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  cardTitle: { color: '#2c3e50', fontSize: '1.3rem', marginBottom: '10px', borderBottom: '2px solid #3498db', paddingBottom: '5px' },
  cardDescription: { color: '#7f8c8d', fontSize: '0.95rem', marginBottom: '20px' },
  createButton: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  examItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  studentExam: { color: '#2c3e50' },
  studentCount: { color: '#7f8c8d' },
  alertItem: { borderBottom: '1px solid #eee', padding: '10px 0', color: '#e74c3c' },
  alertTime: { color: '#7f8c8d', fontSize: '0.8rem' },
  emptyMsg: { color: '#95a5a6', fontStyle: 'italic' }
};

export default TeacherDashboard;
