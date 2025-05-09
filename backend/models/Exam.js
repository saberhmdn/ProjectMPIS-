const mongoose = require('mongoose');

// Define the Question schema
const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
        default: 'multiple-choice'
    },
    options: [{
        text: {
            type: String,
            required: function() {
                return this.questionType === 'multiple-choice' || this.questionType === 'true-false';
            }
        },
        isCorrect: {
            type: Boolean,
            default: false
        }
    }],
    correctAnswer: String,
    points: {
        type: Number,
        default: 1,
        min: 0
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

// Add a pre-save hook to validate dates
ExamSchema.pre('save', function(next) {
    if (this.endTime <= this.startTime) {
        const error = new Error('End time must be after start time');
        return next(error);
    }
    next();
});

module.exports = mongoose.model('Exam', ExamSchema); 
