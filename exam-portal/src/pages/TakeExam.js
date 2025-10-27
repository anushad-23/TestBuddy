import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "./TakeExam.css";

function TakeExam() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  // ✅ Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/exams");
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error("❌ Error fetching exams:", err);
      }
    };

    fetchExams();

    // ✅ Real-time updates: When a teacher creates a new exam
    const socket = io("http://localhost:8081");
    socket.on("new-exam", (exam) => {
      alert(`📢 New exam added: ${exam.title}`);
      setExams((prev) => [...prev, exam]);
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Group exams by date for timeline
  const groupedExams = exams.reduce((acc, exam) => {
    const createdDate = new Date(exam.createdAt).toISOString().split("T")[0];
    if (!acc[createdDate]) acc[createdDate] = [];
    acc[createdDate].push(exam);
    return acc;
  }, {});

  // ✅ Calculate today's and upcoming exams
  const today = new Date().toISOString().split("T")[0];
  const todaysExams = exams.filter(
    (exam) => new Date(exam.createdAt).toISOString().split("T")[0] === today
  );
  const upcomingExams = exams.filter(
    (exam) => new Date(exam.createdAt) > new Date()
  );

  // ✅ Navigate to the exam-taking page
  const handleExamClick = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="dashboard-layout">
      {/* Left: Exam Timeline */}
      <div className="exam-dashboard">
        <h1 className="timeline-title">📅 Exam Timeline</h1>

        <div className="exam-timeline">
          {Object.keys(groupedExams).length === 0 ? (
            <p className="empty-msg">No exams available yet.</p>
          ) : (
            Object.keys(groupedExams).map((date) => (
              <div key={date} className="exam-group">
                <h2 className="exam-date">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>

                {groupedExams[date].map((exam) => (
                  <div
                    key={exam._id}
                    className="exam-item"
                    onClick={() => handleExamClick(exam._id)}
                  >
                    <div className="exam-time">
                      <p>⏰ {exam.duration} mins</p>
                    </div>
                    <div className="exam-details">
                      <div className="exam-subject">{exam.subject}</div>
                      <div className="exam-type">
                        {exam.questions?.length || 0} questions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right: Summary Cards */}
      <div className="sidebar">
        <div className="summary-card">
          <h3>✅ Today's Schedule</h3>
          <p>{today}</p>
          {todaysExams.length > 0 ? (
            todaysExams.map((exam) => (
              <p key={exam._id}>
                {exam.title} ({exam.subject}) - {exam.duration} mins
              </p>
            ))
          ) : (
            <div className="empty-msg">
              No events today <br /> Enjoy your free day!
            </div>
          )}
        </div>

        <div className="summary-card">
          <h3>🔔 Upcoming Exams</h3>
          {upcomingExams.length > 0 ? (
            upcomingExams.map((exam) => (
              <p key={exam._id}>
                {exam.title} on{" "}
                {new Date(exam.createdAt).toLocaleDateString()} (
                {exam.subject})
              </p>
            ))
          ) : (
            <div className="empty-msg">No upcoming exams</div>
          )}
        </div>

        <div className="summary-card">
          <h3>📅 Quick Stats</h3>
          <p>
            Total Exams: <b>{exams.length}</b>
          </p>
          <p>
            Upcoming: <b>{upcomingExams.length}</b>
          </p>
          <p>
            Today: <b>{todaysExams.length}</b>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TakeExam;
