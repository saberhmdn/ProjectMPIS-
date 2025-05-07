const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register a new student
router.post('/register', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);

        const { firstName, lastName, email, password, studentId, department, level, phoneNumber } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !studentId || !department || !level) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: {
                    firstName: !firstName,
                    lastName: !lastName,
                    email: !email,
                    password: !password,
                    studentId: !studentId,
                    department: !department,
                    level: !level
                }
            });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({
                message: 'Student already exists. Please login instead.',
                shouldLogin: true
            });
        }

        // Check if studentId is already taken
        const existingStudentId = await Student.findOne({ studentId });
        if (existingStudentId) {
            return res.status(400).json({
                message: 'Student ID already exists. Please use a different ID.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const student = new Student({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            studentId,
            department,
            level,
            phoneNumber,
            role: 'student'
        });

        console.log('Attempting to save student:', student);
        await student.save();
        console.log('Student saved successfully');

        // Generate JWT token
        const token = jwt.sign(
            { studentId: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Student registered successfully',
            token,
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                studentId: student.studentId,
                department: student.department,
                level: student.level,
                role: 'student'
            }
        });
    } catch (error) {
        console.error('Student registration error:', error);
        res.status(500).json({
            message: 'Error registering student',
            error: error.message,
            stack: error.stack
        });
    }
});

// Login student
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Student login attempt:', { email });

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find student
        const student = await Student.findOne({ email });
        if (!student) {
            console.log('Student login failed: Student not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            console.log('Student login failed: Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Student login successful:', student._id);

        // Generate JWT token
        const token = jwt.sign(
            { studentId: student._id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            student: {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                studentId: student.studentId,
                department: student.department,
                level: student.level,
                role: 'student'
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get student profile (protected route)
router.get('/profile', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

module.exports = router; 
