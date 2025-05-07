const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Create a new course (protected route - teachers only)
router.post('/', auth, async (req, res) => {
    try {
        const { courseName, courseCode, description, department, level } = req.body;

        // Validate required fields
        if (!courseName || !courseCode || !description || !department || !level) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missingFields: {
                    courseName: !courseName,
                    courseCode: !courseCode,
                    description: !description,
                    department: !department,
                    level: !level
                }
            });
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ courseCode });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        const course = new Course({
            courseName,
            courseCode,
            description,
            department,
            level,
            teacher: req.teacherId || req.user.userId, // Support both auth middleware versions
            students: [],
            exams: [],
            isActive: true
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Course creation error:', error);
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
});

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'firstName lastName email');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
});

// Get a specific course
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('teacher', 'firstName lastName email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
});

// Update a course (protected route - teachers only)
router.put('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if the teacher is the owner of the course
        if (course.teacher.toString() !== req.teacherId) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
});

// Delete a course (protected route - teachers only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if the teacher is the owner of the course
        if (course.teacher.toString() !== req.teacherId) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await course.remove();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
});

module.exports = router; 
