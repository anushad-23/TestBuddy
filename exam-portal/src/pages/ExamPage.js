import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./ExamPage.css";

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const studentName = localStorage.getItem("username") || "Student";
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 30); // default 30 mins
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // ✅ Connect to backend + fetch exam
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Identify as student for real-time alerts
    newSocket.emit("register_role", { role: "STUDENT" });

    // Fetch exam data from backend
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/exams/${examId}`);
        const data = await res.json();
        setExam(data);
        setTimeLeft((data.duration || 30) * 60); // set duration from DB
      } catch (err) {
        console.error("❌ Failed to fetch exam:", err);
      }
    };

    fetchExam();

    return () => newSocket.disconnect();
  }, [examId]);

  // ✅ Tab switch detection → sends alert to teacher
  useEffect(() => {
    if (!socket) return;

    const handleVisibility = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        socket.emit("exam_tab_switch", {
          student: studentName,
          examId: exam?.title || examId,
        });

        alert(`⚠️ Tab switch detected! (${newCount} times)`);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [socket, tabSwitchCount, exam, examId]);

  // ✅ Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ✅ Select answer
  const handleAnswer = (option) => {
    setAnswers({ ...answers, [exam.questions[currentQuestion]._id]: option });
  };

  // ✅ Submit answers to backend
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: studentName,
          examId,
          answers,
        }),
      });

      const data = await res.json();
      alert("✅ Exam submitted successfully!");
      console.log("Submission saved:", data);
      navigate("/student");
    } catch (err) {
      console.error("❌ Failed to submit exam:", err);
      alert("Submission failed. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!exam) return <div className="exam-loading">Loading exam...</div>;

  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <div className="exam-page">
      {tabSwitchCount > 0 && (
        <div className="violation-warning">
          ⚠️ {tabSwitchCount} tab switch violation(s) reported to instructor
        </div>
      )}

      <div className="exam-header">
        <h2>{exam.title}</h2>
        <div className="exam-timer">
          Time Left: <span className="time">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-section">
        <div className="question-card">
          <h3>{exam.questions[currentQuestion].question}</h3>
          <div className="options-list">
            {exam.questions[currentQuestion].options.map((option, idx) => (
              <label key={idx} className="option">
                <input
                  type="radio"
                  name={`q-${exam.questions[currentQuestion]._id}`}
                  value={option}
                  checked={answers[exam.questions[currentQuestion]._id] === option}
                  onChange={() => handleAnswer(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="navigation">
          <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}>
            ← Previous
          </button>

          <div className="question-dots">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentQuestion ? "active" : ""} ${
                  answers[exam.questions[idx]._id] ? "answered" : ""
                }`}
                onClick={() => setCurrentQuestion(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === exam.questions.length - 1 ? (
            <button onClick={handleSubmit}>Submit Exam</button>
          ) : (
            <button onClick={() => setCurrentQuestion(prev => prev + 1)}>
              Next →
            </button>
          )}
        </div>
      </div>

      <div className="exam-warning">
        <h4>⚠️ Important Notice</h4>
        <p>
          This exam is being monitored in real-time. Tab switching or leaving the
          exam window will be detected and reported to your instructor.
        </p>
      </div>
    </div>
  );
};

export default ExamPage;
