import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamService from '../services/ExamService';
import { useAuth } from '../context/AuthContext';

const CreateExam = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        startTime: '',
        endTime: '',
        examType: type || 'mcq',
        questions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? 'exists' : 'missing');
        
        // Redirect if not logged in or not a teacher
        if (!token || !user) {
            console.log('No token or user, redirecting to login');
            navigate('/login');
            return;
        }

        if (user.role !== 'teacher') {
            console.log('User is not a teacher, redirecting');
            navigate('/student-dashboard');
            return;
        }

        // Set exam type based on URL parameter
        setFormData(prev => ({
            ...prev,
            examType: type || 'mcq'
        }));
    }, [type, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            // Check if token exists before submitting
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You are not logged in. Please log in again.');
                setLoading(false);
                navigate('/login');
                return;
            }
            
            // Validate dates
            const startDate = new Date(formData.startTime);
            const endDate = new Date(formData.endTime);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                setError('Please enter valid start and end times');
                setLoading(false);
                return;
            }
            
            if (endDate <= startDate) {
                setError('End time must be after start time');
                setLoading(false);
                return;
            }
            
            // Format the data to match the backend model
            const examData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                duration: parseInt(formData.duration, 10),
                startTime: formData.startTime,
                endTime: formData.endTime,
                examType: formData.examType,
                questions: [] // Will be added later in a separate page
            };
            
            console.log('Submitting exam data:', examData);
            
            // Validate required fields
            if (!examData.title || !examData.description || !examData.duration || 
                !examData.startTime || !examData.endTime || !examData.examType) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }
            
            const result = await ExamService.createExam(examData);
            console.log('Exam created successfully:', result);
            
            // Redirect to add questions page instead of dashboard
            navigate(`/add-questions/${result.exam._id}`);
        } catch (err) {
            console.error('Error creating exam:', err);
            
            if (err.response) {
                // Server responded with an error
                if (err.response.status === 401) {
                    setError('Authentication failed. Please log in again.');
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else if (err.response.status === 400) {
                    // Validation error
                    if (err.response.data.errors) {
                        // Format validation errors
                        const errorMessages = Object.values(err.response.data.errors).join(', ');
                        setError(`Validation error: ${errorMessages}`);
                    } else {
                        setError(err.response.data?.message || 'Invalid exam data');
                    }
                } else {
                    setError(err.response.data?.message || 'Failed to create exam');
                }
            } else if (err.request) {
                // No response received
                setError('No response from server. Please check your connection.');
            } else {
                // Other error
                setError(err.message || 'An error occurred while creating the exam');
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format date-time for input
    const formatDateTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Create {type === 'mcq' ? 'Multiple Choice' : 'Written'} Exam
                </h1>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                            Exam Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label htmlFor="duration" className="block text-gray-700 text-sm font-bold mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                min="5"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="startTime" className="block text-gray-700 text-sm font-bold mb-2">
                                Start Time *
                            </label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                name="startTime"
                                value={formatDateTime(formData.startTime)}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="endTime" className="block text-gray-700 text-sm font-bold mb-2">
                                End Time *
                            </label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                name="endTime"
                                value={formatDateTime(formData.endTime)}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Questions</h2>
                        <p className="text-sm text-gray-600">
                            You can add questions after creating the exam.
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/teacher-dashboard')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Exam'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExam;







