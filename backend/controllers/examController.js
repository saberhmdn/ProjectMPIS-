const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

// Create a new exam
exports.createExam = async (req, res) => {
    try {
        const { title, description, questions, duration, startTime, endTime } = req.body;

        const exam = new Exam({
            title,
            description,
            teacher: req.user.userId,
            questions,
            duration,
            startTime,
            endTime
        });

        await exam.save();
        res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
};

// Get all exams for a teacher
exports.getTeacherExams = async (req, res) => {
    try {
        const exams = await Exam.find({ teacher: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

// Get all active exams for students
exports.getActiveExams = async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).sort({ startTime: 1 });

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active exams', error: error.message });
    }
};

// Get exam details
exports.getExamDetails = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // If student is requesting, don't send correct answers
        if (req.user.role === 'student') {
            const examWithoutAnswers = {
                ...exam.toObject(),
                questions: exam.questions.map(q => ({
                    questionText: q.questionText,
                    options: q.options,
                    points: q.points
                }))
            };
            return res.json(examWithoutAnswers);
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam details', error: error.message });
    }
};

// Submit exam answers
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;
        const exam = await Exam.findById(examId);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Check if exam is still active
        const now = new Date();
        if (now < exam.startTime || now > exam.endTime) {
            return res.status(400).json({ message: 'Exam is not active' });
        }

        // Check if student has already submitted
        const existingSubmission = await Submission.findOne({
            exam: examId,
            student: req.user.userId,
            isSubmitted: true
        });

        if (existingSubmission) {
            return res.status(400).json({ message: 'Exam already submitted' });
        }

        // Calculate scores for each answer
        const scoredAnswers = answers.map(answer => {
            const question = exam.questions.id(answer.questionId);
            const isCorrect = question.correctAnswer === answer.selectedAnswer;
            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect,
                pointsEarned: isCorrect ? question.points : 0
            };
        });

        const submission = new Submission({
            exam: examId,
            student: req.user.userId,
            answers: scoredAnswers,
            startTime: now,
            endTime: now,
            isSubmitted: true
        });

        await submission.save();
        res.json({ message: 'Exam submitted successfully', submission });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting exam', error: error.message });
    }
};

// Get exam results
exports.getExamResults = async (req, res) => {
    try {
        const { examId } = req.params;

        // If teacher is requesting, get all submissions
        if (req.user.role === 'teacher') {
            const submissions = await Submission.find({ exam: examId })
                .populate('student', 'username email')
                .sort({ totalScore: -1 });
            return res.json(submissions);
        }

        // If student is requesting, get only their submission
        const submission = await Submission.findOne({
            exam: examId,
            student: req.user.userId
        }).populate('exam', 'title totalPoints');

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam results', error: error.message });
    }
}; 