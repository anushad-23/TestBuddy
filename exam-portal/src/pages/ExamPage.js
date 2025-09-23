import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./ExamPage.css";

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const studentId = "1"; // Replace with real student ID
  const studentName = localStorage.getItem("username") || "Student";

  // Dummy questions for demo
  const questions = [
    { id: 1, question: "2 + 2 = ?", options: ["3", "4", "5"], answer: "4" },
    { id: 2, question: "Capital of France?", options: ["Berlin", "Paris", "Rome"], answer: "Paris" },
    { id: 3, question: "React is a ___ library?", options: ["UI", "Database", "OS"], answer: "UI" },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour demo
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Connect to backend
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("exam-start", {
      studentId,
      studentName,
      examId,
    });

    return () => newSocket.close();
  }, [examId]);

  // Tab switch detection
  useEffect(() => {
    if (!socket) return;

    const handleVisibility = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        socket.emit("exam_tab_switch", {
          studentId,
          studentName,
          examId,
          severity: "high",
        });

        alert(`⚠️ Tab switch detected! Violation #${newCount}`);
      }
    };

    const handleBlur = () => {
      socket.emit("exam_tab_switch", {
        studentId,
        studentName,
        examId,
        severity: "medium",
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [socket, tabSwitchCount, examId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: option });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (socket) {
      socket.emit("exam-submit", { studentId, studentName, examId, answers });
    }
    alert("Exam submitted successfully!");
    navigate("/student");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="exam-page">
      {tabSwitchCount > 0 && (
        <div className="violation-warning">
          ⚠️ {tabSwitchCount} tab switch violation(s) reported to instructor
        </div>
      )}

      <div className="exam-header">
        <h2>Exam ID: {examId}</h2>
        <div className="exam-timer">
          Time Left: <span className="time">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-section">
        <div className="question-card">
          <h3>{questions[currentQuestion].question}</h3>
          <div className="options-list">
            {questions[currentQuestion].options.map((option, idx) => (
              <label key={idx} className="option">
                <input
                  type="radio"
                  name={`q-${questions[currentQuestion].id}`}
                  value={option}
                  checked={answers[questions[currentQuestion].id] === option}
                  onChange={() => handleAnswer(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="navigation">
          <button onClick={handlePrev} disabled={currentQuestion === 0}>← Previous</button>

          <div className="question-dots">
            {questions.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentQuestion ? "active" : ""} ${
                  answers[questions[idx].id] ? "answered" : ""
                }`}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button onClick={handleSubmit}>Submit Exam</button>
          ) : (
            <button onClick={handleNext}>Next →</button>
          )}
        </div>
      </div>

      <div className="exam-warning">
        <h4>⚠️ Important Notice</h4>
        <p>
          This exam is being monitored in real-time. Tab switching, opening new windows, or using unauthorized resources will be detected and reported.
        </p>
      </div>
    </div>
  );
};

export default ExamPage;