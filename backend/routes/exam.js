const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');


router.get('/public', examController.getPublicExams);


router.post('/', auth, examController.createExam);
router.get('/teacher', auth, examController.getTeacherExams);
router.get('/active', auth, examController.getActiveExams);
router.get('/:examId', auth, examController.getExamDetails);
router.put('/:examId/questions', auth, examController.updateExamQuestions);
router.post('/:examId/submit', auth, examController.submitExam);
router.get('/:examId/results', auth, examController.getExamResults);
router.put('/:examId', auth, examController.updateExam);
router.delete('/:examId', auth, examController.deleteExam);

module.exports = router;
