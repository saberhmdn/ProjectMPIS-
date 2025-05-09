const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedAnswer: {
        type: String
    },
    writtenAnswer: {
        type: String
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String
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
        type: Date,
        required: true
    },
    totalScore: {
        type: Number,
        default: 0
    },
    isSubmitted: {
        type: Boolean,
        default: false
    },
    isGraded: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate total score before saving
submissionSchema.pre('save', function(next) {
    if (this.answers && this.answers.length > 0) {
        this.totalScore = this.answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
    }
    next();
});

module.exports = mongoose.model('Submission', submissionSchema); 
