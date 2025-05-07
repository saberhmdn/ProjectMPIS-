import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'courses') {
            fetchCourses();
        } else if (activeTab === 'exams') {
            fetchExams();
        } else if (activeTab === 'results') {
            fetchResults();
        }
    }, [activeTab]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.API_BASE_URL}/api/courses/my-courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.API_BASE_URL}/api/exams/student`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExams(response.data);
        } catch (err) {
            setError('Failed to fetch exams');
            console.error('Error fetching exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.API_BASE_URL}/api/exams/results`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(response.data);
        } catch (err) {
            setError('Failed to fetch results');
            console.error('Error fetching results:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading && courses.length === 0 && exams.length === 0 && results.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Student Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4">Welcome, {user?.firstName} {user?.lastName}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <div className="mb-6">
                    <div className="flex border-b">
                        <button
                            className={`py-2 px-4 ${activeTab === 'courses' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
                            onClick={() => setActiveTab('courses')}
                        >
                            Courses
                        </button>
                        <button
                            className={`py-2 px-4 ${activeTab === 'exams' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
                            onClick={() => setActiveTab('exams')}
                        >
                            Exams
                        </button>
                        <button
                            className={`py-2 px-4 ${activeTab === 'results' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
                            onClick={() => setActiveTab('results')}
                        >
                            Results
                        </button>
                    </div>
                </div>
                
                {activeTab === 'courses' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-4">My Courses</h2>
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {courses.length > 0 ? (
                                    courses.map(course => (
                                        <div key={course._id} className="bg-white overflow-hidden shadow rounded-lg border">
                                            <div className="px-4 py-5 sm:p-6">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                    {course.courseName || course.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {course.courseCode || 'No course code'}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {course.description || 'No description available'}
                                                </p>
                                                <div className="mt-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {course.department || 'Department'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No courses found. Please contact your administrator.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'exams' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-4">Upcoming Exams</h2>
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {exams.length > 0 ? (
                                    exams.map(exam => (
                                        <div key={exam._id} className="bg-white overflow-hidden shadow rounded-lg border">
                                            <div className="px-4 py-5 sm:p-6">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                    {exam.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {exam.description}
                                                </p>
                                                <div className="mt-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        exam.examType === 'mcq' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {exam.examType === 'mcq' ? 'Multiple Choice' : 'Written'}
                                                    </span>
                                                </div>
                                                <div className="mt-3 text-sm text-gray-500">
                                                    <p>Duration: {exam.duration} minutes</p>
                                                    <p>Start: {new Date(exam.startTime).toLocaleString()}</p>
                                                    <p>End: {new Date(exam.endTime).toLocaleString()}</p>
                                                </div>
                                                <div className="mt-4">
                                                    <button
                                                        onClick={() => navigate(`/exams/${exam._id}`)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                    >
                                                        Take Exam
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No upcoming exams found.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'results' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-4">Exam Results</h2>
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {results.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Exam
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Course
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Score
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.map(result => (
                                                <tr key={result._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {result.exam?.title || 'Unknown Exam'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {result.course?.name || 'Unknown Course'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {result.score}/{result.totalPoints} ({Math.round((result.score / result.totalPoints) * 100)}%)
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(result.submittedAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500">No exam results found.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
