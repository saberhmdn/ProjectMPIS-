const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Teacher routes
router.post('/', examController.createExam);
router.get('/teacher', examController.getTeacherExams);

// Student routes
router.get('/active', examController.getActiveExams);
router.get('/:examId', examController.getExamDetails);
router.post('/:examId/submit', examController.submitExam);
router.get('/:examId/results', examController.getExamResults);

module.exports = router; 