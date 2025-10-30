const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 },
});

const examSchema = new mongoose.Schema({
  title: String,
  subject: String,
  duration: Number, // in minutes
  totalQuestions: Number,
  description: String,
  questions: [questionSchema],
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  scheduledFor: Date,
});

module.exports = mongoose.model("Exam", examSchema);

