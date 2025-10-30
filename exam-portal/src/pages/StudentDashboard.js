// src/pages/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaClock, FaCheckCircle, FaListAlt } from "react-icons/fa";
import io from "socket.io-client";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  // ✅ Fetch all exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/exams");
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("❌ Error fetching exams:", err);
      }
    };

    fetchExams();

    // ✅ Real-time updates using Socket.IO
    const socket = io("http://localhost:5000");

    // When teacher creates a new exam, update student dashboard instantly
    socket.on("new-exam", (exam) => {
      alert(`📢 New Exam Added: ${exam.title}`);
      setExams((prev) => [...prev, exam]);
    });

    return () => socket.disconnect();
  }, []);

  // Only show exams with future or today scheduledFor, if set
  const now = new Date();
  const scheduledExams = exams.filter(exam =>
    exam.scheduledFor ? new Date(exam.scheduledFor) >= now : true
  ).sort((a, b) => {
    const dA = a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt);
    const dB = b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt);
    return dA - dB;
  });

  // ✅ Compute statistics dynamically
  const stats = {
    totalExams: exams.length,
    completedExams: exams.filter((exam) => exam.status === "completed").length,
    pendingExams: exams.filter((exam) => exam.status !== "completed").length,
    averageScore:
      exams.filter((exam) => exam.score).reduce((acc, exam) => acc + exam.score, 0) /
        (exams.filter((exam) => exam.score).length || 1),
  };

  // ✅ Start Exam Navigation
  const startExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  // ✅ View Completed Exam Result
  const viewResults = (examId) => {
    navigate(`/exam-results/${examId}`);
  };

  // ✅ Go Back
  const goBack = () => navigate("/");

  return (
    <div style={styles.dashboard}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={goBack} style={styles.backButton}>
          <FaArrowLeft style={styles.backIcon} />
          Back to Home
        </button>
        <h1 style={styles.title}>Student Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, Student</p>
      </div>

      {/* Stats Section */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaListAlt />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Exams</h3>
            <div style={styles.statValue}>{stats.totalExams}</div>
            <div style={styles.statDescription}>This semester</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaCheckCircle />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Average Score</h3>
            <div style={styles.statValue}>{Math.round(stats.averageScore)}%</div>
            <div style={{ ...styles.statDescription, ...styles.positive }}>
              +9% from last month
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaClock />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Pending Exams</h3>
            <div style={styles.statValue}>{stats.pendingExams}</div>
            <div style={styles.statDescription}>Due this week</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FaCheckCircle />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Completed</h3>
            <div style={styles.statValue}>{stats.completedExams}</div>
            <div style={styles.statDescription}>
              {stats.totalExams > 0
                ? `${Math.round(
                    (stats.completedExams / stats.totalExams) * 100
                  )}% completion rate`
                : "No exams"}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.divider}></div>

      {/* Available Exams */}
      <div style={styles.examsSection}>
        <h2 style={styles.sectionTitle}>Available Exams</h2>

        {scheduledExams.length === 0 ? (
          <p style={styles.noExams}>No exams available right now.</p>
        ) : (
          scheduledExams.map((exam) => (
            <div key={exam._id} style={styles.examCard}>
              <div style={styles.examHeader}>
                <label style={styles.examLabel}>{exam.title}</label>
                <span style={styles.examSubject}>{exam.subject}</span>
              </div>
              <div style={styles.examDetails}>
                {exam.scheduledFor && (
                  <span style={{color: '#2c3e50', fontWeight: 'bold'}}>
                    Scheduled: {new Date(exam.scheduledFor).toLocaleString()}
                  </span>
                )}
                <span>{exam.duration} minutes</span>
                <span>{exam.questions?.length || 0} questions</span>
                <span style={styles.dueDate}>
                  Created: {new Date(exam.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                style={{ ...styles.examButton, ...styles.startExam }}
                onClick={() => startExam(exam._id)}
              >
                Start Exam
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ✅ Same styling retained from your version */
const styles = {
  dashboard: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    color: "#333",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: { marginBottom: "30px" },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "15px",
  },
  backIcon: { fontSize: "14px" },
  title: { color: "#2c3e50", marginBottom: "5px", fontSize: "2rem" },
  subtitle: { color: "#7f8c8d", fontSize: "1.1rem" },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "30px",
    gap: "15px",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    flex: "1",
    minWidth: "200px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  statIcon: {
    fontSize: "24px",
    color: "#3498db",
    backgroundColor: "#e8f4fc",
    padding: "12px",
    borderRadius: "8px",
  },
  statContent: { flex: 1 },
  statTitle: {
    color: "#7f8c8d",
    fontSize: "0.9rem",
    marginBottom: "5px",
    fontWeight: "normal",
  },
  statValue: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "5px",
  },
  statDescription: { fontSize: "0.9rem", color: "#7f8c8d" },
  positive: { color: "#2ecc71" },
  divider: {
    border: "none",
    height: "1px",
    backgroundColor: "#ecf0f1",
    margin: "30px 0",
  },
  examsSection: { marginBottom: "30px" },
  sectionTitle: {
    color: "#2c3e50",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #ecf0f1",
    fontSize: "1.5rem",
  },
  examCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "15px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  examHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
    gap: "10px",
  },
  examLabel: {
    fontWeight: "bold",
    color: "#2c3e50",
    marginRight: "auto",
  },
  examSubject: {
    backgroundColor: "#e8f4fc",
    color: "#3498db",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.8rem",
  },
  examDetails: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
    color: "#7f8c8d",
    fontSize: "0.9rem",
    flexWrap: "wrap",
  },
  dueDate: {
    marginLeft: "auto",
    fontWeight: "bold",
    color: "#e74c3c",
  },
  examButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  startExam: { backgroundColor: "#3498db", color: "white" },
  noExams: {
    textAlign: "center",
    color: "#7f8c8d",
    fontStyle: "italic",
    padding: "20px",
  },
};

export default StudentDashboard;
