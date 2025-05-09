import api from './api';

const ExamService = {
    // Create a new exam
    createExam: async (examData) => {
        try {
            console.log('Creating exam with data:', examData);
            
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            console.log('Token exists in localStorage');
            
            // Validate exam data before sending
            if (!examData.title || !examData.description || !examData.duration || 
                !examData.startTime || !examData.endTime) {
                throw new Error('Missing required exam fields');
            }
            
            // Ensure duration is a number
            examData.duration = parseInt(examData.duration, 10);
            if (isNaN(examData.duration)) {
                throw new Error('Duration must be a valid number');
            }
            
            // Ensure dates are valid
            const startDate = new Date(examData.startTime);
            const endDate = new Date(examData.endTime);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
            }
            
            // Make the API request
            const response = await api.post('/api/exams', examData);
            console.log('Exam created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating exam:', error);
            
            // Enhance error with more details if available
            if (error.response && error.response.data) {
                error.message = error.response.data.message || error.message;
                error.details = error.response.data.errors || error.response.data.error;
            }
            
            throw error;
        }
    },
    
    // Get all exams for a teacher
    getTeacherExams: async () => {
        try {
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            const response = await api.get('/api/exams/teacher');
            return response.data;
        } catch (error) {
            console.error('Error fetching teacher exams:', error);
            throw error;
        }
    },
    
    // Get exam by ID
    getExamById: async (examId) => {
        try {
            const response = await api.get(`/api/exams/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam ${examId}:`, error);
            throw error;
        }
    },

    // Update exam questions
    updateExamQuestions: async (examId, questions) => {
        try {
            console.log(`Updating questions for exam ${examId}`);
            console.log('Questions to be sent:', questions);
            
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            // Make the API request
            const response = await api.put(`/api/exams/${examId}/questions`, { questions });
            console.log('Questions updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating questions for exam ${examId}:`, error);
            
            // Enhance error with more details if available
            if (error.response && error.response.data) {
                error.message = error.response.data.message || error.message;
                error.details = error.response.data.errors || error.response.data.error;
            }
            
            throw error;
        }
    },

    // Delete an exam
    deleteExam: async (examId) => {
        try {
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            const response = await api.delete(`/api/exams/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting exam ${examId}:`, error);
            throw error;
        }
    },

    // Get public exams (no auth required)
    getPublicExams: async () => {
        try {
            const response = await api.get('/api/exams/public');
            return response.data;
        } catch (error) {
            console.error('Error fetching public exams:', error);
            throw error;
        }
    },

    // Get active exams for students
    getActiveExams: async () => {
        try {
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            const response = await api.get('/api/exams/active');
            return response.data;
        } catch (error) {
            console.error('Error fetching active exams:', error);
            throw error;
        }
    }
};

export default ExamService;







