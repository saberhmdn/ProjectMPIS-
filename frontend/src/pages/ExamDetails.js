import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExamService from '../services/ExamService';

const ExamDetails = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleDeleteExam = async () => {
        if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            try {
                setLoading(true);
                await ExamService.deleteExam(examId);
                navigate('/teacher-dashboard', { state: { message: 'Exam deleted successfully' } });
            } catch (err) {
                console.error('Error deleting exam:', err);
                const errorMessage = err.message || 'Failed to delete exam. Please try again.';
                setError(errorMessage);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        // Check if user is logged in
        if (!user) {
            navigate('/login');
            return;
        }

        // Fetch exam details
        const fetchExam = async () => {
            try {
                setLoading(true);
                const examData = await ExamService.getExamById(examId);
                setExam(examData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching exam:', err);
                setError('Failed to load exam details. Please try again.');
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId, navigate, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Not Found</h2>
                    <p className="text-gray-700">The exam you're looking for doesn't exist or you don't have permission to access it.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                {/* Header with enhanced gradient background */}
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
                        </svg>
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 relative">{exam.title}</h1>
                    <p className="text-indigo-100 text-lg relative">{exam.description || 'Created by ' + exam.createdBy}</p>
                </div>
                
                {/* Exam details with enhanced styling */}
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <span className="bg-indigo-100 p-1.5 rounded-md mr-3">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Exam Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-gray-50 rounded-xl p-6 flex items-start hover:shadow-md transition-shadow duration-300">
                            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-600 mb-1">Exam Type</p>
                                <p className="text-xl font-semibold text-gray-800">{exam.examType === 'mcq' ? 'Multiple Choice' : 'Written'}</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6 flex items-start hover:shadow-md transition-shadow duration-300">
                            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-600 mb-1">Duration</p>
                                <p className="text-xl font-semibold text-gray-800">{exam.duration} minutes</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6 flex items-start hover:shadow-md transition-shadow duration-300">
                            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-600 mb-1">Start Time</p>
                                <p className="text-xl font-semibold text-gray-800">{new Date(exam.startTime).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-6 flex items-start hover:shadow-md transition-shadow duration-300">
                            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-600 mb-1">End Time</p>
                                <p className="text-xl font-semibold text-gray-800">{new Date(exam.endTime).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Questions section with enhanced styling */}
                    <div className="mt-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="bg-indigo-100 p-1.5 rounded-md mr-3">
                                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            Questions
                        </h2>
                        
                        {exam.questions && exam.questions.length > 0 ? (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                <div className="flex items-center">
                                    <div className="bg-indigo-100 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-xl font-bold text-indigo-600">{exam.questions.length}</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-800">Questions in this exam</p>
                                        <p className="text-gray-600">Click "Add Questions" to manage exam questions</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 text-center border border-indigo-100">
                                <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Questions Added</h3>
                                <p className="text-gray-600 max-w-md mx-auto">This exam doesn't have any questions yet. Add questions to make this exam available to students.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Action buttons with enhanced styling */}
                <div className="bg-gray-50 p-8 flex flex-wrap gap-4 justify-between border-t border-gray-100">
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center border border-gray-200 shadow-sm hover:shadow"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                    
                    <div className="flex flex-wrap gap-4">
                        <Link 
                            to={`/edit-exam/${exam._id}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Exam
                        </Link>
                        
                        <Link 
                            to={`/add-questions/${exam._id}`}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Questions
                        </Link>
                        
                        <button 
                            onClick={handleDeleteExam}
                            className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Exam
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamDetails;










