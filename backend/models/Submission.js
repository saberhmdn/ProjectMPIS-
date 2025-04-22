const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
});

const submissionSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [answerSchema],
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    totalScore: {
        type: Number,
        default: 0
    },
    isSubmitted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate total score before saving
submissionSchema.pre('save', function (next) {
    if (this.isModified('answers')) {
        this.totalScore = this.answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    }
    next();
});

module.exports = mongoose.model('Submission', submissionSchema); 