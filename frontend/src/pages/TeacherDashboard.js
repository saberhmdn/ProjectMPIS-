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
                    // If unauthorized, redirect to login
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
                await ExamService.deleteExam(examId);
                setExams(exams.filter(exam => exam._id !== examId));
                setError('');
            } catch (err) {
                console.error('Error deleting exam:', err);
                if (err.response && err.response.status === 401) {
                    // If unauthorized, redirect to login
                    logout();
                    navigate('/login');
                } else {
                    setError('Failed to delete exam. Please try again.');
                }
            }
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const renderStatusBadge = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) {
            return (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Upcoming
                </span>
            );
        } else if (now >= start && now <= end) {
            return (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                </span>
            );
        } else {
            return (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Completed
                </span>
            );
        }
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Exams</h2>
                        <div className="flex space-x-4">
                            <Link
                                to="/create-exam/mcq"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Create MCQ Exam
                            </Link>
                            <Link
                                to="/create-exam/written"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Create Written Exam
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">
                            <div className="spinner"></div>
                            <p className="mt-2 text-gray-600">Loading exams...</p>
                        </div>
                    ) : exams.length === 0 ? (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6 text-center">
                                <p className="text-gray-500">You haven't created any exams yet.</p>
                                <p className="text-gray-500 mt-2">
                                    Click on "Create MCQ Exam" or "Create Written Exam" to get started.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {exams.map((exam) => (
                                        <tr key={exam._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {exam.examType === 'mcq' ? 'Multiple Choice' : 'Written'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {exam.duration} minutes
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(exam.startTime)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(exam.endTime)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStatusBadge(exam.startTime, exam.endTime)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/exam/${exam._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    View
                                                </Link>
                                                <Link to={`/edit-exam/${exam._id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteExam(exam._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
