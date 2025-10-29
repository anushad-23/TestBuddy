import React, { useState } from "react";

const CreateExam = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    },
  ]);

  const [examDetails, setExamDetails] = useState({
    title: "",
    subject: "",
    duration: 60,
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 1,
      },
    ]);
  };

  // ✅ Handle question text or correct answer changes
  const handleQuestionChange = (id, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  // ✅ Handle option changes
  const handleOptionChange = (questionId, optionIndex, value) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  // ✅ Handle exam detail changes
  const handleExamDetailChange = (field, value) => {
    setExamDetails({ ...examDetails, [field]: value });
  };

  // ✅ Save exam to MongoDB via backend API
  const handleSaveExam = async () => {
    if (!examDetails.title || !examDetails.subject) {
      alert("Please fill in the exam title and subject.");
      return;
    }

    if (questions.length === 0 || questions.some((q) => !q.question)) {
      alert("Please add at least one question with text.");
      return;
    }

    setLoading(true);

    try {
      const examData = {
        ...examDetails,
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
        })),
      };

      const response = await fetch("http://localhost:5000/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Exam created successfully!");
        // Clear form after save
        setExamDetails({
          title: "",
          subject: "",
          duration: 60,
          description: "",
        });
        setQuestions([
          { id: 1, question: "", options: ["", "", "", ""], correctAnswer: "", points: 1 },
        ]);
      } else {
        alert("❌ Failed to create exam: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving exam:", err);
      alert("❌ Failed to save exam. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Create New Exam</h1>
      <p style={styles.subHeader}>Set up a new exam with questions and details.</p>

      {/* Exam Details Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Exam Details</h2>

        <div style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Exam Title</label>
            <input
              type="text"
              placeholder="e.g., Mathematics Final Exam"
              style={styles.input}
              value={examDetails.title}
              onChange={(e) => handleExamDetailChange("title", e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Subject</label>
            <select
              style={styles.select}
              value={examDetails.subject}
              onChange={(e) => handleExamDetailChange("subject", e.target.value)}
            >
              <option value="">Select subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Duration (minutes)</label>
            <input
              type="number"
              style={styles.input}
              value={examDetails.duration}
              onChange={(e) =>
                handleExamDetailChange("duration", parseInt(e.target.value))
              }
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Description (Optional)</label>
          <textarea
            placeholder="Enter exam instructions..."
            style={styles.textarea}
            value={examDetails.description}
            onChange={(e) =>
              handleExamDetailChange("description", e.target.value)
            }
          />
        </div>
      </div>

      {/* Questions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Questions</h2>

        {questions.map((question, index) => (
          <div key={question.id} style={styles.questionCard}>
            <h3 style={styles.questionTitle}>Question {index + 1}</h3>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Question</label>
              <input
                type="text"
                placeholder="Enter question text..."
                style={styles.input}
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(question.id, "question", e.target.value)
                }
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Options</label>
              {question.options.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  style={styles.optionInput}
                  value={opt}
                  onChange={(e) =>
                    handleOptionChange(question.id, i, e.target.value)
                  }
                />
              ))}
            </div>

            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Correct Answer</label>
                <select
                  style={styles.select}
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      question.id,
                      "correctAnswer",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt || `Option ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Points</label>
                <input
                  type="number"
                  style={styles.input}
                  value={question.points}
                  onChange={(e) =>
                    handleQuestionChange(
                      question.id,
                      "points",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button style={styles.addButton} onClick={addQuestion}>
          + Add Question
        </button>

        {/* ✅ Save Exam Button */}
        <button
          style={styles.saveButton}
          onClick={handleSaveExam}
          disabled={loading}
        >
          {loading ? "Saving..." : "💾 Save Exam"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    color: "#333",
  },
  header: { color: "#2c3e50", marginBottom: "10px" },
  subHeader: { color: "#7f8c8d", marginBottom: "30px" },
  section: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    color: "#2c3e50",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #ecf0f1",
  },
  formRow: { display: "flex", gap: "20px", marginBottom: "20px" },
  inputGroup: { flex: 1, marginBottom: "15px" },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    backgroundColor: "white",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    minHeight: "100px",
  },
  questionCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #e9ecef",
  },
  questionTitle: { color: "#2c3e50", marginBottom: "15px" },
  optionInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    marginBottom: "10px",
  },
  addButton: {
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    marginBottom: "15px",
  },
  saveButton: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
};

export default CreateExam;
