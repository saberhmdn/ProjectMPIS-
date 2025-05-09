const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register a new teacher
router.post('/register', async (req, res) => {
    try {
        console.log('Received registration request:', req.body);

        const { firstName, lastName, email, password, department, phoneNumber, subjects } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !department || !subjects) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields: {
                    firstName: !firstName,
                    lastName: !lastName,
                    email: !email,
                    password: !password,
                    department: !department,
                    subjects: !subjects
                }
            });
        }

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({
                message: 'Teacher already exists. Please login instead.',
                shouldLogin: true
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new teacher
        const teacher = new Teacher({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            department,
            phoneNumber,
            subjects,
            role: 'teacher'
        });

        console.log('Attempting to save teacher:', teacher);
        await teacher.save();
        console.log('Teacher saved successfully');

        // Generate JWT token
        const token = jwt.sign(
            { teacherId: teacher._id, role: 'teacher' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Teacher registered successfully',
            token,
            teacher: {
                id: teacher._id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                department: teacher.department,
                subjects: teacher.subjects,
                role: 'teacher'
            }
        });
    } catch (error) {
        console.error('Teacher registration error:', error);
        res.status(500).json({
            message: 'Error registering teacher',
            error: error.message,
            stack: error.stack
        });
    }
});

// Login teacher
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Teacher login attempt:', { email });

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find teacher
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            console.log('Teacher login failed: Teacher not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            console.log('Teacher login failed: Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Teacher login successful:', teacher._id);

        // Generate JWT token with consistent property names
        const token = jwt.sign(
            { 
                userId: teacher._id, // Use userId consistently
                role: 'teacher'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            teacher: {
                id: teacher._id,
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
                department: teacher.department,
                subjects: teacher.subjects,
                role: 'teacher'
            }
        });
    } catch (error) {
        console.error('Teacher login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get teacher profile (protected route)
router.get('/profile', auth, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.teacherId).select('-password');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

module.exports = router;
