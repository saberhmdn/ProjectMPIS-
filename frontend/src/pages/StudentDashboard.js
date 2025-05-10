import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ExamService from '../services/ExamService';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [activeExams, setActiveExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchActiveExams = async () => {
            try {
                setLoading(true);
                const examsData = await ExamService.getActiveExams();
                setActiveExams(examsData);
            } catch (err) {
                console.error('Error fetching exams:', err);
                setError('Failed to load exams. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchActiveExams();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-indigo-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-white text-xl font-bold">Exam System</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-white mr-4">Welcome, {user?.firstName}</span>
                            <button
                                onClick={logout}
                                className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Active Exams</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                These are the exams that are currently available for you to take.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Upcoming Deadlines
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading your exams...</p>
                        </div>
                    ) : activeExams.length === 0 ? (
                        <div className="bg-white shadow-md rounded-lg p-8 text-center">
                            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Exams</h3>
                            <p className="text-gray-500">There are no active exams at the moment.</p>
                            <p className="text-gray-500 mt-2">Check back later for upcoming exams.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeExams.map((exam) => (
                                <div key={exam._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-indigo-500">
                                    <div className="md:flex">
                                        <div className="p-6 md:flex-1">
                                            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                                <h3 className="text-xl font-semibold text-gray-900">{exam.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    exam.examType === 'mcq' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {exam.examType === 'mcq' ? 'Multiple Choice' : 'Written'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
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
                                                    <span>Ends: {formatDate(exam.endTime)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-6 flex items-center justify-center md:w-64">
                                            <Link 
                                                to={`/take-exam/${exam._id}`} 
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
                                            >
                                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                Take Exam
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-6 sm:px-0 mt-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Exam Results</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            View your past exam results and performance.
                        </p>
                    </div>
                    
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6 text-center">
                            <p className="text-gray-500">Results will be displayed here after you complete exams.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
