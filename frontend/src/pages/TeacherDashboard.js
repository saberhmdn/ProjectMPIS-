import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ExamService from '../services/ExamService';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        // Check if user is logged in and is a teacher
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'teacher') {
            navigate('/student-dashboard');
            return;
        }

        const fetchExams = async () => {
            try {
                setLoading(true);
                const examsData = await ExamService.getTeacherExams();
                setExams(examsData);
                setError('');
            } catch (err) {
                console.error('Error fetching exams:', err);
                if (err.response && err.response.status === 401) {
                    logout();
                    navigate('/login');
                } else {
                    setError('Failed to load exams. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [user, navigate, logout]);

    const handleDeleteExam = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                setLoading(true);
                await ExamService.deleteExam(examId);
                setExams(prevExams => prevExams.filter(exam => exam._id !== examId));
            } catch (err) {
                console.error('Error deleting exam:', err);
                setError(err.message || 'Failed to delete exam. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getExamStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return 'upcoming';
        if (now >= start && now <= end) return 'active';
        return 'completed';
    };

    const filteredExams = activeTab === 'all' 
        ? exams 
        : exams.filter(exam => getExamStatus(exam.startTime, exam.endTime) === activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pb-32">
                <nav className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-white text-xl font-bold">Exam System</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-white">Welcome, {user?.firstName}</span>
                            <button
                                onClick={logout}
                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                {/* Create exam card */}
                <div className="bg-white rounded-lg shadow-lg mb-6 p-6 flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create a New Exam</h2>
                        <p className="mt-1 text-sm text-gray-500">Set up a new exam for your students</p>
                    </div>
                    <Link
                        to="/create-exam"
                        className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create an Exam
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                    activeTab === 'all'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                All Exams
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                    activeTab === 'active'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                    activeTab === 'upcoming'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                    activeTab === 'completed'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Completed
                            </button>
                        </nav>
                    </div>

                    {/* Exams content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading exams...</p>
                            </div>
                        ) : filteredExams.length === 0 ? (
                            <div className="text-center py-10">
                                <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                                <p className="text-gray-500">
                                    {activeTab === 'all' 
                                        ? "You haven't created any exams yet." 
                                        : `You don't have any ${activeTab} exams.`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredExams.map((exam) => {
                                    const status = getExamStatus(exam.startTime, exam.endTime);
                                    return (
                                        <div key={exam._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
                                            <div className="p-6 border-l-4 border-indigo-500">
                                                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                                                    <h3 className="text-xl font-semibold text-gray-900">{exam.title}</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            exam.examType === 'mcq' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {exam.examType === 'mcq' ? 'Multiple Choice' : 'Written'}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            status === 'active' ? 'bg-green-100 text-green-800' :
                                                            status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {status === 'active' ? 'Active' :
                                                             status === 'upcoming' ? 'Upcoming' : 'Completed'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>{exam.duration} minutes</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Starts: {formatDate(exam.startTime)}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Ends: {formatDate(exam.endTime)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    <Link 
                                                        to={`/exam/${exam._id}`} 
                                                        className="action-button bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors flex items-center px-3 py-2 rounded-md text-sm font-medium"
                                                    >
                                                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </Link>
                                                    <Link 
                                                        to={`/exam/${exam._id}/results`} 
                                                        className="action-button bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center px-3 py-2 rounded-md text-sm font-medium"
                                                    >
                                                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Results
                                                    </Link>
                                                    <Link 
                                                        to={`/edit-exam/${exam._id}`} 
                                                        className="action-button bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center px-3 py-2 rounded-md text-sm font-medium"
                                                    >
                                                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteExam(exam._id)}
                                                        className="action-button bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center px-3 py-2 rounded-md text-sm font-medium"
                                                    >
                                                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
