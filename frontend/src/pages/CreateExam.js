import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamService from '../services/ExamService';
import { useAuth } from '../context/AuthContext';

const CreateExam = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        startTime: '',
        endTime: '',
        examType: 'mcq',
        isActive: true,
        questions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if token exists
        const token = localStorage.getItem('token');
        
        // Redirect if not logged in or not a teacher
        if (!token || !user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'teacher') {
            navigate('/student-dashboard');
            return;
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        return dateTimeStr;
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
                isActive: formData.isActive,
                questions: []
            };
            
            // Validate required fields
            if (!examData.title || !examData.description || !examData.duration || 
                !examData.startTime || !examData.endTime || !examData.examType) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }
            
            const result = await ExamService.createExam(examData);
            navigate(`/add-questions/${result.exam._id}`);
        } catch (err) {
            console.error('Error creating exam:', err);
            
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Authentication failed. Please log in again.');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else if (err.response.status === 400) {
                    if (err.response.data.errors) {
                        const errorMessages = Object.values(err.response.data.errors).join(', ');
                        setError(`Validation error: ${errorMessages}`);
                    } else {
                        setError(err.response.data?.message || 'Invalid exam data');
                    }
                } else {
                    setError(err.response.data?.message || 'Failed to create exam');
                }
            } else {
                setError('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center">
                        <button 
                            onClick={() => navigate('/teacher-dashboard')}
                            className="mr-4 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-white">Create New Exam</h1>
                    </div>
                </div>
            </div>
            
            {/* Main content - shifted up to overlap with header */}
            <div className="-mt-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="title">
                                    Exam Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="description">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="examType">
                                    Exam Type *
                                </label>
                                <select
                                    id="examType"
                                    name="examType"
                                    value={formData.examType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="written">Written</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700" htmlFor="duration">
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        id="duration"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        min="5"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700" htmlFor="startTime">
                                        Start Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="startTime"
                                        name="startTime"
                                        value={formatDateTime(formData.startTime)}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700" htmlFor="endTime">
                                        End Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="endTime"
                                        name="endTime"
                                        value={formatDateTime(formData.endTime)}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="isActive"
                                        name="isActive"
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isActive" className="font-medium text-gray-700">Make exam active immediately</label>
                                    <p className="text-gray-500">Students will be able to see and take this exam once it's within the time window.</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-800">Questions</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            You'll be able to add questions after creating the exam.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/teacher-dashboard')}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : 'Create Exam'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateExam;







