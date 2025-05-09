const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

// Create a new exam
exports.createExam = async (req, res) => {
    try {
        const { title, description, questions, duration, startTime, endTime, examType } = req.body;
        
        console.log('Create exam request received');
        console.log('User from request:', req.user);
        console.log('Request body:', req.body);
        
        // Check if user is authenticated and is a teacher
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Validate required fields
        if (!title || !description || !duration || !startTime || !endTime) {
            return res.status(400).json({ 
                message: 'Missing required fields', 
                missingFields: {
                    title: !title,
                    description: !description,
                    duration: !duration,
                    startTime: !startTime,
                    endTime: !endTime
                }
            });
        }

        // Validate dates
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format for start or end time' });
        }
        
        if (end <= start) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Create the exam with explicit teacher ID
        const teacherId = req.user.userId;
        console.log('Using teacher ID:', teacherId);
        
        // Create a new exam instance with safe defaults
        const exam = new Exam({
            title: title.trim(),
            description: description.trim(),
            teacher: teacherId,
            questions: Array.isArray(questions) ? questions : [],
            duration: parseInt(duration, 10) || 60, // Default to 60 minutes if parsing fails
            startTime: start,
            endTime: end,
            examType: examType || 'quiz' // Default to 'quiz' if not provided
        });

        console.log('Exam to be saved:', JSON.stringify({
            title: exam.title,
            description: exam.description,
            teacher: exam.teacher,
            duration: exam.duration,
            startTime: exam.startTime,
            endTime: exam.endTime,
            examType: exam.examType
        }));
        
        // Save the exam with explicit error handling
        const savedExam = await exam.save();
        console.log('Exam saved successfully with ID:', savedExam._id);
        
        res.status(201).json({ 
            message: 'Exam created successfully', 
            exam: savedExam 
        });
    } catch (error) {
        console.error('Error creating exam:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check for specific MongoDB/Mongoose errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            // Extract validation error messages
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: 'Invalid data format', 
                field: error.path, 
                value: error.value 
            });
        }
        
        // Generic server error
        res.status(500).json({ 
            message: 'Error creating exam', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

// Get active exams for students
exports.getActiveExams = async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).populate('teacher', 'firstName lastName');
        
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
                    _id: q._id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    options: q.options.map(o => ({ _id: o._id, text: o.text })),
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

// Submit an exam (for students)
exports.submitExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const { answers } = req.body;
        
        // Validate if exam exists and is active
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        const now = new Date();
        if (now < new Date(exam.startTime) || now > new Date(exam.endTime)) {
            return res.status(400).json({ message: 'Exam is not currently active' });
        }
        
        // Check if student has already submitted
        const existingSubmission = await Submission.findOne({
            exam: examId,
            student: req.user.userId,
            isSubmitted: true
        });
        
        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this exam' });
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
        
        // Verify exam exists
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // If teacher is requesting, return all submissions
        if (req.user.role === 'teacher') {
            // Verify teacher owns the exam
            if (exam.teacher.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Not authorized to view these results' });
            }
            
            const submissions = await Submission.find({ exam: examId, isSubmitted: true })
                .populate('student', 'firstName lastName email');
                
            return res.json(submissions);
        }
        
        // If student is requesting, return only their submission
        const submission = await Submission.findOne({
            exam: examId,
            student: req.user.userId,
            isSubmitted: true
        });
        
        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this exam' });
        }
        
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam results', error: error.message });
    }
};

// Update an exam
exports.updateExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const updates = req.body;
        
        // Find the exam
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Verify teacher owns the exam
        if (exam.teacher.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this exam' });
        }
        
        // Update the exam
        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            updates,
            { new: true, runValidators: true }
        );
        
        res.json({ message: 'Exam updated successfully', exam: updatedExam });
    } catch (error) {
        res.status(500).json({ message: 'Error updating exam', error: error.message });
    }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;
        
        // Find the exam
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Verify teacher owns the exam
        if (exam.teacher.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this exam' });
        }
        
        // Delete the exam and related submissions
        await Exam.findByIdAndDelete(examId);
        await Submission.deleteMany({ exam: examId });
        
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
};

// Update exam questions
exports.updateExamQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        const { questions } = req.body;
        
        console.log(`Updating questions for exam ${examId}`);
        console.log('Questions received:', questions);
        
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Find the exam
        const exam = await Exam.findById(examId);
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Check if the user is the teacher who created the exam
        if (exam.teacher.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You are not authorized to update this exam' });
        }
        
        // Validate questions
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'At least one question is required' });
        }
        
        // Update the exam with the new questions
        exam.questions = questions;
        
        // Save the updated exam
        await exam.save();
        
        res.json({ 
            message: 'Exam questions updated successfully',
            exam
        });
    } catch (error) {
        console.error('Error updating exam questions:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            // Extract validation error messages
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors 
            });
        }
        
        res.status(500).json({ 
            message: 'Error updating exam questions', 
            error: error.message 
        });
    }
};

// Get public exams (no auth required)
exports.getPublicExams = async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now },
            isPublic: true // Add this field to your Exam model if needed
        }).select('title description startTime endTime'); // Only return public info
        
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public exams', error: error.message });
    }
};
