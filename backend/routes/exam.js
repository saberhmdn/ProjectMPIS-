const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');

// Get public exams (no auth required)
router.get('/public', examController.getPublicExams);

// Apply auth middleware to all routes below this line
router.use(auth);

// Create a new exam
router.post('/', examController.createExam);

// Get all exams for a teacher
router.get('/teacher', examController.getTeacherExams);

// Get active exams for students
router.get('/active', examController.getActiveExams);

// Get exam details
router.get('/:examId', examController.getExamDetails);

// Update exam questions - make sure this route is defined before other routes with :examId
router.put('/:examId/questions', examController.updateExamQuestions);

// Submit an exam (for students)
router.post('/:examId/submit', examController.submitExam);

// Get exam results
router.get('/:examId/results', examController.getExamResults);

// Update an exam
router.put('/:examId', examController.updateExam);

// Delete an exam
router.delete('/:examId', examController.deleteExam);

module.exports = router; 
