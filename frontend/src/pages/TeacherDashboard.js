import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import '../styles/Dashboard.css';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('courses');
    const [showExamForm, setShowExamForm] = useState(false);
    const navigate = useNavigate();
    
    const [newCourse, setNewCourse] = useState({
        courseName: '',
        courseCode: '',
        description: '',
        department: '',
        level: 1
    });
    
    const [newExam, setNewExam] = useState({
        title: '',
        description: '',
        courseId: '',
        examType: 'mcq', // 'mcq' or 'written'
        duration: 60,
        startTime: '',
        endTime: '',
        questions: []
    });
    
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // Fetch courses
                const coursesResponse = await axios.get(`${config.API_BASE_URL}/api/courses/my-courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourses(coursesResponse.data);
                
                // Fetch exams
                const examsResponse = await axios.get(`${config.API_BASE_URL}/api/exams/teacher`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExams(examsResponse.data);
                
            } catch (err) {
                setError('Failed to fetch data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleExamInputChange = (e) => {
        const { name, value } = e.target;
        setNewExam(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleOptionChange = (index, value) => {
        const updatedOptions = [...currentQuestion.options];
        updatedOptions[index] = value;
        setCurrentQuestion(prev => ({
            ...prev,
            options: updatedOptions
        }));
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${config.API_BASE_URL}/api/courses`, newCourse, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(prev => [...prev, response.data]);
            setNewCourse({
                courseName: '',
                courseCode: '',
                description: '',
                department: '',
                level: 1
            });
        } catch (err) {
            setError('Failed to create course');
            console.error('Error creating course:', err);
        }
    };
    
    const addQuestion = () => {
        if (!currentQuestion.questionText) {
            alert('Question text is required');
            return;
        }
        
        if (newExam.examType === 'mcq') {
            // Validate MCQ question
            if (currentQuestion.options.some(opt => !opt)) {
                alert('All options must be filled');
                return;
            }
            if (!currentQuestion.correctAnswer) {
                alert('Please select the correct answer');
                return;
            }
        }
        
        setNewExam(prev => ({
            ...prev,
            questions: [...prev.questions, {...currentQuestion}]
        }));
        
        // Reset current question
        setCurrentQuestion({
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 1
        });
    };
    
    const removeQuestion = (index) => {
        setNewExam(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };
    
    const handleCreateExam = async (e) => {
        e.preventDefault();
        
        if (newExam.questions.length === 0) {
            alert('Please add at least one question');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const examData = {
                ...newExam,
                startTime: new Date(newExam.startTime).toISOString(),
                endTime: new Date(newExam.endTime).toISOString()
            };
            
            const response = await axios.post(`${config.API_BASE_URL}/api/exams`, examData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setExams(prev => [...prev, response.data.exam]);
            setShowExamForm(false);
            setNewExam({
                title: '',
                description: '',
                courseId: '',
                examType: 'mcq',
                duration: 60,
                startTime: '',
                endTime: '',
                questions: []
            });
            
            alert('Exam created successfully!');
        } catch (err) {
            setError('Failed to create exam');
            console.error('Error creating exam:', err);
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

    if (loading) {
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
                            <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
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
                    </div>
                </div>
                
                {activeTab === 'courses' && (
                    <>
                        <div className="bg-white shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-medium mb-4">Create New Course</h2>
                            <form onSubmit={handleCreateCourse}>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                                            Course Name
                                        </label>
                                        <input
                                            type="text"
                                            name="courseName"
                                            id="courseName"
                                            required
                                            value={newCourse.courseName}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">
                                            Course Code
                                        </label>
                                        <input
                                            type="text"
                                            name="courseCode"
                                            id="courseCode"
                                            required
                                            value={newCourse.courseCode}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            id="department"
                                            required
                                            value={newCourse.department}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                                            Level (1-5)
                                        </label>
                                        <input
                                            type="number"
                                            name="level"
                                            id="level"
                                            min="1"
                                            max="5"
                                            required
                                            value={newCourse.level}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            required
                                            value={newCourse.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Create Course
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.map(course => (
                                <div key={course._id} className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {course.name}
                                        </h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                            {course.description}
                                        </p>
                                        <div className="mt-4">
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {course.students?.length || 0} students enrolled
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                {activeTab === 'exams' && (
                    <>
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-lg font-medium">Your Exams</h2>
                            <button
                                onClick={() => setShowExamForm(!showExamForm)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                            >
                                {showExamForm ? 'Cancel' : 'Create New Exam'}
                            </button>
                        </div>
                        
                        {showExamForm && (
                            <div className="bg-white shadow rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-medium mb-4">Create New Exam</h2>
                                <form onSubmit={handleCreateExam}>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                Exam Title
                                            </label>
                                            <input
                                                type="text"
                                                name="title"
                                                id="title"
                                                required
                                                value={newExam.title}
                                                onChange={handleExamInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                id="description"
                                                value={newExam.description}
                                                onChange={handleExamInputChange}
                                                rows={2}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">
                                                Course
                                            </label>
                                            <select
                                                name="courseId"
                                                id="courseId"
                                                required
                                                value={newExam.courseId}
                                                onChange={handleExamInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">Select a course</option>
                                                {courses.map(course => (
                                                    <option key={course._id} value={course._id}>
                                                        {course.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="examType" className="block text-sm font-medium text-gray-700">
                                                Exam Type
                                            </label>
                                            <select
                                                name="examType"
                                                id="examType"
                                                required
                                                value={newExam.examType}
                                                onChange={handleExamInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="mcq">Multiple Choice</option>
                                                <option value="written">Written</option>
                                            </select>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                                    Duration (minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="duration"
                                                    id="duration"
                                                    required
                                                    min="1"
                                                    value={newExam.duration}
                                                    onChange={handleExamInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                                    Start Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    name="startTime"
                                                    id="startTime"
                                                    required
                                                    value={newExam.startTime}
                                                    onChange={handleExamInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                                                    End Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    name="endTime"
                                                    id="endTime"
                                                    required
                                                    value={newExam.endTime}
                                                    onChange={handleExamInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="border-t pt-4">
                                            <h3 className="text-md font-medium mb-2">Add Questions</h3>
                                            
                                            <div className="mb-4 p-4 border rounded-md bg-gray-50">
                                                <div className="mb-3">
                                                    <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
                                                        Question Text
                                                    </label>
                                                    <textarea
                                                        name="questionText"
                                                        id="questionText"
                                                        value={currentQuestion.questionText}
                                                        onChange={handleQuestionChange}
                                                        rows={2}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                
                                                {newExam.examType === 'mcq' && (
                                                    <>
                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Options
                                                            </label>
                                                            {currentQuestion.options.map((option, index) => (
                                                                <div key={index} className="flex items-center mb-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="correctAnswer"
                                                                        value={option}
                                                                        checked={currentQuestion.correctAnswer === option}
                                                                        onChange={handleQuestionChange}
                                                                        className="mr-2"
                                                                        disabled={!option}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                                        placeholder={`Option ${index + 1}`}
                                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                                
                                                <div className="mb-3">
                                                    <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                                                        Points
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="points"
                                                        id="points"
                                                        min="1"
                                                        value={currentQuestion.points}
                                                        onChange={handleQuestionChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    />
                                                </div>
                                                
                                                <button
                                                    type="button"
                                                    onClick={addQuestion}
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    Add Question
                                                </button>
                                            </div>
                                            
                                            {newExam.questions.length > 0 && (
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium mb-2">Added Questions ({newExam.questions.length})</h4>
                                                    <ul className="border rounded-md divide-y">
                                                        {newExam.questions.map((q, index) => (
                                                            <li key={index} className="p-3 flex justify-between items-center">
                                                                <div>
                                                                    <p className="font-medium">{q.questionText}</p>
                                                                    <p className="text-sm text-gray-500">Points: {q.points}</p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeQuestion(index)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Create Exam
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {exams.map(exam => (
                                <div key={exam._id} className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {exam.title}
                                        </h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                            {exam.description}
                                        </p>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                exam.examType === 'mcq' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {exam.examType === 'mcq' ? 'Multiple Choice' : 'Written'}
                                            </span>
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {exam.questions.length} questions
                                            </span>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-500">
                                            <p>Duration: {exam.duration} minutes</p>
                                            <p>Start: {new Date(exam.startTime).toLocaleString()}</p>
                                            <p>End: {new Date(exam.endTime).toLocaleString()}</p>
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                onClick={() => navigate(`/exams/${exam._id}/results`)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View Results
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard; 
