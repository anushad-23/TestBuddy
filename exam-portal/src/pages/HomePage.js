// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaBell, FaCog, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

const HomePage = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    onLogin('student');
    navigate('/student');
  };

  const handleTeacherLogin = () => {
    onLogin('teacher');
    navigate('/teacher');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to <span style={styles.highlight}>Test Buddy</span></h1>
        <p style={styles.subtitle}>
          Advanced online exam platform with real-time monitoring
        </p>
      </header>

      <section style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.iconContainer}>
            <FaShieldAlt style={styles.icon} />
          </div>
          <h3 style={styles.featureTitle}>Secure Monitoring</h3>
          <p style={styles.featureText}>Real-time tab-switching detection and activity monitoring</p>
        </div>
        
        <div style={styles.feature}>
          <div style={styles.iconContainer}>
            <FaBell style={styles.icon} />
          </div>
          <h3 style={styles.featureTitle}>Instant Alerts</h3>
          <p style={styles.featureText}>Immediate notifications to teachers when suspicious activity is detected</p>
        </div>
        
        <div style={styles.feature}>
          <div style={styles.iconContainer}>
            <FaCog style={styles.icon} />
          </div>
          <h3 style={styles.featureTitle}>Easy Management</h3>
          <p style={styles.featureText}>Comprehensive dashboards for both students and teachers</p>
        </div>
      </section>

      <div style={styles.divider}></div>

      <section style={styles.roleSelection}>
        <h2 style={styles.roleTitle}>Choose Your Role</h2>
        
        <div style={styles.roles}>
          <div style={styles.roleCard}>
            <div style={styles.roleIcon}>
              <FaUserGraduate style={styles.roleIconSvg} />
            </div>
            <div style={styles.roleContent}>
              <h3 style={styles.roleName}>Student Portal</h3>
              <p style={styles.roleDescription}>Take exams, view results, and track your academic progress</p>
              <ul style={styles.roleFeatures}>
                <li style={styles.roleFeature}>Take online examinations</li>
                <li style={styles.roleFeature}>View exam results and feedback</li>
                <li style={styles.roleFeature}>Track performance history</li>
              </ul>
            </div>
            <button style={styles.studentButton} onClick={handleStudentLogin}>
              Enter as Student
            </button>
          </div>

          <div style={styles.roleCard}>
            <div style={styles.roleIcon}>
              <FaChalkboardTeacher style={styles.roleIconSvg} />
            </div>
            <div style={styles.roleContent}>
              <h3 style={styles.roleName}>Teacher Portal</h3>
              <p style={styles.roleDescription}>Create exams, monitor students, and manage assessments</p>
              <ul style={styles.roleFeatures}>
                <li style={styles.roleFeature}>Create and manage exams</li>
                <li style={styles.roleFeature}>Monitor student activity</li>
                <li style={styles.roleFeature}>View comprehensive results</li>
              </ul>
            </div>
            <button style={styles.teacherButton} onClick={handleTeacherLogin}>
              Enter as Teacher
            </button>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2025 Test Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    color: "#333",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    textAlign: "center",
    marginBottom: "60px",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    color: "white"
  },
  title: {
    fontSize: "2.8rem",
    marginBottom: "15px",
    fontWeight: "700"
  },
  highlight: {
    color: "#FFD700",
    textShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  subtitle: {
    fontSize: "1.3rem",
    opacity: "0.9",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: "1.5"
  },
  features: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "60px",
    gap: "20px"
  },
  feature: {
    flex: "1",
    minWidth: "250px",
    padding: "30px 20px",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer"
  },
  iconContainer: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "#667eea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    color: "white",
    fontSize: "28px"
  },
  icon: {
    fontSize: "28px"
  },
  featureTitle: {
    color: "#2c3e50",
    marginBottom: "15px",
    fontSize: "1.3rem"
  },
  featureText: {
    color: "#7f8c8d",
    lineHeight: "1.6"
  },
  divider: {
    height: "1px",
    background: "linear-gradient(to right, transparent, #ccc, transparent)",
    margin: "40px 0",
    width: "100%"
  },
  roleSelection: {
    marginBottom: "40px"
  },
  roleTitle: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "40px",
    fontSize: "2rem"
  },
  roles: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "30px"
  },
  roleCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    position: "relative",
    overflow: "hidden"
  },
  roleIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    color: "#667eea",
    fontSize: "32px",
    border: "2px solid #e9ecef"
  },
  roleIconSvg: {
    fontSize: "32px"
  },
  roleContent: {
    textAlign: "center",
    marginBottom: "25px",
    flexGrow: 1
  },
  roleName: {
    color: "#2c3e50",
    marginBottom: "15px",
    fontSize: "1.5rem"
  },
  roleDescription: {
    color: "#7f8c8d",
    marginBottom: "20px",
    lineHeight: "1.5"
  },
  roleFeatures: {
    textAlign: "left",
    paddingLeft: "20px",
    margin: "0",
    color: "#7f8c8d"
  },
  roleFeature: {
    marginBottom: "10px",
    lineHeight: "1.5"
  },
  studentButton: {
    padding: "14px 30px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    backgroundColor: "#3498db",
    color: "white",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    boxShadow: "0 4px 6px rgba(50, 152, 219, 0.3)"
  },
  teacherButton: {
    padding: "14px 30px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    backgroundColor: "#2ecc71",
    color: "white",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    boxShadow: "0 4px 6px rgba(46, 204, 113, 0.3)"
  },
  footer: {
    textAlign: "center",
    marginTop: "auto",
    padding: "20px",
    color: "#7f8c8d",
    borderTop: "1px solid #ecf0f1"
  }
};

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    .feature:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
    }
    .role-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
    }
    .student-button:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
    }
    .teacher-button:hover {
      background-color: #27ae60;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
};

// Call the function to add hover effects
addHoverEffects();

export default HomePage;