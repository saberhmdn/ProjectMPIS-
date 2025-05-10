const mongoose = require('mongoose');

// Define the Question schema (as a subdocument)
const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    default: 'multiple-choice'
  },
  points: {
    type: Number,
    default: 1
  }
});

// Define the Exam schema
const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Exam description is required'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  questions: {
    type: [QuestionSchema],
    default: []
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Exam duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  examType: {
    type: String,
    enum: {
      values: ['quiz', 'midterm', 'final', 'assignment', 'mcq', 'written'],
      message: '{VALUE} is not a valid exam type'
    },
    default: 'quiz'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exam', ExamSchema); 
