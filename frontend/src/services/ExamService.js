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
            console.log('Questions to be sent:', JSON.stringify(questions, null, 2));
            
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            // Validate question format before sending
            questions.forEach((q, i) => {
                if (!q.text) {
                    throw new Error(`Question ${i+1} is missing text`);
                }
                
                if (q.type === 'multiple-choice') {
                    if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                        throw new Error(`Question ${i+1} is missing options array`);
                    }
                    
                    // Check that all options have text
                    q.options.forEach((opt, j) => {
                        if (!opt.text || opt.text.trim() === '') {
                            throw new Error(`Option ${j+1} in question ${i+1} is missing text`);
                        }
                    });
                    
                    // Check that at least one option is correct
                    if (!q.options.some(opt => opt.isCorrect)) {
                        throw new Error(`Question ${i+1} must have at least one correct answer`);
                    }
                }
            });
            
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
                console.error('Server error details:', error.details);
            }
            
            throw error;
        }
    },

    // Delete an exam
    deleteExam: async (examId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            console.log(`Attempting to delete exam ${examId}`);
            const response = await api.delete(`/api/exams/${examId}`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            console.log('Delete response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error deleting exam ${examId}:`, error);
            
            // Enhance error message based on status code
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error('Exam not found. It may have been already deleted.');
                } else if (error.response.status === 403) {
                    throw new Error('You are not authorized to delete this exam.');
                } else if (error.response.status === 500) {
                    throw new Error('Server error. Please try again later.');
                }
            }
            
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
    },

    // Submit an exam
    submitExam: async (examId, answerData) => {
        try {
            // Check if token exists before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            // Log the data being sent
            console.log(`Submitting exam ${examId} with data:`, answerData);
            
            // Make the API request with explicit headers
            const response = await api.post(`/api/exams/${examId}/submit`, answerData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Submission response:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error submitting exam ${examId}:`, error);
            
            // Log more details about the error
            if (error.response) {
                console.log('Response data:', error.response.data);
                console.log('Response status:', error.response.status);
            }
            
            throw error;
        }
    },

    // Update an exam
    updateExam: async (examId, examData) => {
        const token = localStorage.getItem('token');
        const response = await api.put(`/api/exams/${examId}`, examData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Delete an exam
    deleteExam: async (examId) => {
        const token = localStorage.getItem('token');
        const response = await api.delete(`/api/exams/${examId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get exam results (for teachers)
    getExamResults: async (examId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                throw new Error('Authentication required. Please log in again.');
            }
            
            const response = await api.get(`/api/exams/${examId}/results`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('API response for exam results:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam results for ${examId}:`, error);
            throw error;
        }
    }
};

export default ExamService;







