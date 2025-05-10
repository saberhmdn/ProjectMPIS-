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
    isPassed: {
        type: Boolean,
        default: false
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

// Calculate total score and determine if passed before saving
submissionSchema.pre('save', async function(next) {
    if (this.answers && this.answers.length > 0) {
        this.totalScore = this.answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
        
        try {
            // Get the exam to determine passing score
            await this.populate('exam');
            
            // Default passing threshold is 60% if not specified in the exam
            const passingThreshold = this.exam.passingScore || 0.6;
            const maxPossibleScore = this.exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
            
            // Calculate if passed
            this.isPassed = this.totalScore >= (maxPossibleScore * passingThreshold);
            console.log(`Submission for exam ${this.exam._id}, student ${this.student}: Score=${this.totalScore}, Passed=${this.isPassed}`);
            next();
        } catch (err) {
            console.error('Error determining pass/fail status:', err);
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Submission', submissionSchema); 
