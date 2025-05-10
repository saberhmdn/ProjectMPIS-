const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new exam
exports.createExam = async (req, res) => {
  try {
    const { title, description, questions, duration, startTime, endTime, examType } = req.body;
    
    // Validate required fields
    if (!title || !description || !duration || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Create the exam
    const exam = new Exam({
      title,
      description,
      teacher: req.user.userId,
      questions: questions || [],
      duration,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      examType: examType || 'quiz'
    });
    
    await exam.save();
    
    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Error creating exam', error: error.message });
  }
};

// Get all exams for a teacher
exports.getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ teacher: req.user.userId });
    res.json(exams);
  } catch (error) {
    console.error('Error fetching teacher exams:', error);
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
    });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching active exams:', error);
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
    
    res.json(exam);
  } catch (error) {
    console.error('Error fetching exam details:', error);
    res.status(500).json({ message: 'Error fetching exam details', error: error.message });
  }
};

// Submit an exam (for students)
exports.submitExam = async (req, res) => {
  try {
    const { answers } = req.body;
    const examId = req.params.examId;
    const studentId = req.user.userId;
    
    if (!answers) {
      return res.status(400).json({ message: 'Please provide answers' });
    }
    
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Format the answers and calculate score
    const formattedAnswers = [];
    let totalScore = 0;
    
    for (const answer of answers) {
      const question = exam.questions.find(q => q._id.toString() === answer.questionId);
      
      if (!question) continue;
      
      let pointsEarned = 0;
      
      // Calculate points based on question type
      if (question.questionType === 'multiple-choice' || question.type === 'multiple-choice') {
        // For multiple choice, check if the selected option is correct
        const selectedOption = question.options[parseInt(answer.answer)];
        if (selectedOption && selectedOption.isCorrect) {
          pointsEarned = question.points || 1;
        }
      } else if (question.questionType === 'true-false' || question.type === 'true-false') {
        // For true/false, check if the answer matches the correct answer
        if (answer.answer === question.correctAnswer) {
          pointsEarned = question.points || 1;
        }
      }
      // For essay/written questions, teacher will grade manually
      
      formattedAnswers.push({
        questionId: answer.questionId,
        answer: answer.answer,
        pointsEarned
      });
      
      totalScore += pointsEarned;
    }
    
    // Calculate if passed (default threshold is 60%)
    const passingThreshold = exam.passingScore || 0.6;
    const maxPossibleScore = exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const isPassed = totalScore >= (maxPossibleScore * passingThreshold);
    
    console.log(`Student ${studentId} submission for exam ${examId}:`);
    console.log(`Total score: ${totalScore}/${maxPossibleScore}`);
    console.log(`Passing threshold: ${passingThreshold * 100}%`);
    console.log(`Passed: ${isPassed}`);
    
    // Create or update submission
    const submission = new Submission({
      exam: examId,
      student: studentId,
      answers: formattedAnswers,
      startTime: new Date(Date.now() - (exam.duration * 60 * 1000)), // Approximate start time
      endTime: new Date(),
      totalScore,
      isPassed,
      isSubmitted: true,
      isGraded: true, // Auto-graded for objective questions
      submittedAt: new Date()
    });
    
    await submission.save();
    
    res.json({
      message: 'Exam submitted successfully',
      totalScore,
      isPassed,
      submission: submission._id
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Error submitting exam', error: error.message });
  }
};

// Get exam results for a teacher
exports.getExamResults = async (req, res) => {
  try {
    const examId = req.params.examId;
    
    // Verify the exam exists and belongs to this teacher
    const exam = await Exam.findById(examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    if (exam.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view these results' });
    }
    
    // Get all submissions for this exam with student details
    const submissions = await Submission.find({ exam: examId })
      .populate('student', 'firstName lastName email')
      .select('student totalScore isPassed isSubmitted submittedAt');
    
    // Calculate statistics
    const totalSubmissions = submissions.length;
    const passedCount = submissions.filter(s => s.isPassed).length;
    const failedCount = submissions.filter(s => s.isSubmitted && !s.isPassed).length;
    const notSubmittedCount = submissions.filter(s => !s.isSubmitted).length;
    
    const passRate = totalSubmissions > 0 ? (passedCount / totalSubmissions) * 100 : 0;
    
    // Log submissions for debugging
    console.log('Submissions found:', submissions.length);
    console.log('Sample submission:', submissions.length > 0 ? JSON.stringify(submissions[0]) : 'No submissions');
    
    res.json({
      examTitle: exam.title,
      totalStudents: totalSubmissions,
      statistics: {
        passed: passedCount,
        failed: failedCount,
        notSubmitted: notSubmittedCount,
        passRate: passRate.toFixed(2) + '%'
      },
      submissions: submissions
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ message: 'Error fetching exam results', error: error.message });
  }
};

// Update an exam
exports.updateExam = async (req, res) => {
  try {
    const { title, description, duration, startTime, endTime, examType, isActive } = req.body;
    
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if user is the teacher who created the exam
    if (exam.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }
    
    // Update fields if provided
    if (title) exam.title = title;
    if (description) exam.description = description;
    if (duration) exam.duration = duration;
    if (startTime) exam.startTime = new Date(startTime);
    if (endTime) exam.endTime = new Date(endTime);
    if (examType) exam.examType = examType;
    if (isActive !== undefined) exam.isActive = isActive;
    
    await exam.save();
    
    res.json({
      message: 'Exam updated successfully',
      exam
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ message: 'Error updating exam', error: error.message });
  }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
  try {
    console.log(`Attempting to delete exam with ID: ${req.params.examId}`);
    console.log(`Request user ID: ${req.user.userId}`);
    
    // Check if the exam ID is valid
    if (!req.params.examId || !req.params.examId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid exam ID format' });
    }
    
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      console.log('Exam not found');
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    console.log(`Exam found. Teacher ID: ${exam.teacher}`);
    
    // Check if user is the teacher who created the exam
    if (exam.teacher.toString() !== req.user.userId) {
      console.log('Authorization failed - user is not the exam creator');
      return res.status(403).json({ message: 'Not authorized to delete this exam' });
    }
    
    console.log('Authorization passed, proceeding with deletion');
    
    // Delete related submissions first
    await Submission.deleteMany({ exam: req.params.examId });
    console.log('Related submissions deleted');
    
    // Use deleteOne instead of remove (which is deprecated)
    const deleteResult = await Exam.deleteOne({ _id: req.params.examId });
    console.log('Delete result:', deleteResult);
    
    if (deleteResult.deletedCount === 0) {
      console.log('Exam was not deleted');
      return res.status(500).json({ message: 'Failed to delete exam' });
    }
    
    console.log('Exam deleted successfully');
    res.json({
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
};

// Update exam questions
exports.updateExamQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Please provide valid questions array' });
    }
    
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Check if user is the teacher who created the exam
    if (exam.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this exam' });
    }
    
    exam.questions = questions;
    await exam.save();
    
    res.json({
      message: 'Exam questions updated successfully',
      exam
    });
  } catch (error) {
    console.error('Error updating exam questions:', error);
    res.status(500).json({ message: 'Error updating exam questions', error: error.message });
  }
};

// Get public exams (no auth required)
exports.getPublicExams = async (req, res) => {
  try {
    const now = new Date();
    const exams = await Exam.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).select('title description startTime endTime');
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching public exams:', error);
    res.status(500).json({ message: 'Error fetching public exams', error: error.message });
  }
};
