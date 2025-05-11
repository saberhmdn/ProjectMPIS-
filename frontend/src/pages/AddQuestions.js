import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamService from '../services/ExamService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AddQuestions = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState({
        questionText: '',
        questionType: 'multiple-choice',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        points: 1
    });

    useEffect(() => {
        // Check if user is logged in and is a teacher
        if (!user || user.role !== 'teacher') {
            navigate('/login');
            return;
        }

        // Fetch exam details
        const fetchExam = async () => {
            try {
                setLoading(true);
                const response = await ExamService.getExamById(examId);
                setExam(response);
                
                // If exam already has questions, load them
                if (response.questions && response.questions.length > 0) {
                    setQuestions(response.questions);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching exam:', err);
                setError('Failed to load exam details');
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId, navigate, user]);

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setCurrentQuestion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOptionChange = (index, e) => {
        const { name, value } = e.target;
        const updatedOptions = [...currentQuestion.options];
        
        if (name === 'isCorrect') {
            // For radio buttons, set all options to false first
            updatedOptions.forEach(option => option.isCorrect = false);
            updatedOptions[index].isCorrect = true;
        } else {
            updatedOptions[index].text = value;
        }
        
        setCurrentQuestion(prev => ({
            ...prev,
            options: updatedOptions
        }));
    };

    const addQuestion = () => {
        // Validate question
        if (!currentQuestion.questionText.trim()) {
            setError('Question text is required');
            return;
        }
        
        // Create a new question with the exact structure expected by the backend
        const newQuestion = {
            text: currentQuestion.questionText.trim(),
            type: currentQuestion.questionType,
            points: parseInt(currentQuestion.points) || 1
        };
        
        // Only add options for multiple-choice questions
        if (currentQuestion.questionType === 'multiple-choice') {
            // For multiple choice, validate that at least one option is selected as correct
            const hasCorrectOption = currentQuestion.options.some(option => option.isCorrect);
            if (!hasCorrectOption) {
                setError('Please select a correct answer');
                return;
            }
            
            // Validate that all options have text
            const emptyOptions = currentQuestion.options.filter(option => !option.text.trim());
            if (emptyOptions.length > 0) {
                setError('All options must have text');
                return;
            }
            
            // Add options only for multiple-choice questions
            newQuestion.options = currentQuestion.options.map(opt => ({
                text: opt.text.trim(),
                isCorrect: opt.isCorrect
            }));
        }
        
        console.log('New question:', newQuestion);
        
        // Add the new question to the questions array
        setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
        
        // Reset the current question form
        setCurrentQuestion({
            questionText: '',
            questionType: 'multiple-choice',
            points: 1,
            options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        });
        
        setError('');
    };

    const removeQuestion = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const saveQuestions = async () => {
        try {
            setLoading(true);
            
            // Validate that there's at least one question
            if (questions.length === 0) {
                setError('Please add at least one question');
                setLoading(false);
                return;
            }
            
            // Create a completely new array with the exact structure expected by the backend
            const formattedQuestions = questions.map(q => {
                const formattedQuestion = {
                    text: q.text,
                    type: q.type,
                    points: q.points || 1
                };
                
                // Only include options for multiple-choice questions
                if (q.type === 'multiple-choice' && q.options) {
                    formattedQuestion.options = q.options.map(opt => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect
                    }));
                }
                
                return formattedQuestion;
            });
            
            // Log the exact data being sent
            console.log('Formatted questions:', JSON.stringify(formattedQuestions, null, 2));
            
            // Try sending the questions directly without using the service
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5001/api/exams/${examId}/questions`, 
                { questions: formattedQuestions },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Response:', response.data);
            navigate('/teacher-dashboard');
        } catch (err) {
            console.error('Error saving questions:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                setError(err.response.data.message || err.response.data.error || 'Server error');
            } else {
                setError(err.message || 'Failed to save questions');
            }
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
                            onClick={() => navigate(-1)}
                            className="mr-4 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-white">
                            {exam ? `Add Questions to ${exam.title}` : 'Loading Exam...'}
                        </h1>
                    </div>
                </div>
            </div>
            
            {/* Main content - shifted up to overlap with header */}
            <div className="-mt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {loading && !exam ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left column - Question Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
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
                                
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <span className="bg-indigo-100 p-1.5 rounded-md mr-3">
                                        <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </span>
                                    Create New Question
                                </h2>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question Text
                                        </label>
                                        <textarea
                                            name="questionText"
                                            value={currentQuestion.questionText}
                                            onChange={handleQuestionChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            rows="3"
                                            placeholder="Enter your question here"
                                        ></textarea>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Question Type
                                            </label>
                                            <select
                                                name="questionType"
                                                value={currentQuestion.questionType}
                                                onChange={handleQuestionChange}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            >
                                                <option value="multiple-choice">Multiple Choice</option>
                                                <option value="true-false">True/False</option>
                                                <option value="short-answer">Short Answer</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Points
                                            </label>
                                            <input
                                                type="number"
                                                name="points"
                                                value={currentQuestion.points}
                                                onChange={handleQuestionChange}
                                                min="1"
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    {currentQuestion.questionType === 'multiple-choice' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Answer Options
                                            </label>
                                            <div className="space-y-3">
                                                {currentQuestion.options.map((option, index) => (
                                                    <div key={index} className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                                                        <input
                                                            type="radio"
                                                            name="isCorrect"
                                                            checked={option.isCorrect}
                                                            onChange={(e) => handleOptionChange(index, e)}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => handleOptionChange(index, { target: { name: 'text', value: e.target.value } })}
                                                            className="ml-3 flex-1 border-0 bg-transparent focus:ring-0 focus:outline-none"
                                                            placeholder={`Option ${index + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct answer</p>
                                        </div>
                                    )}
                                    
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Question
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right column - Questions List */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                                    <span className="flex items-center">
                                        <span className="bg-indigo-100 p-1.5 rounded-md mr-3">
                                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </span>
                                        Questions
                                    </span>
                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {questions.length}
                                    </span>
                                </h2>
                                
                                {questions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500">No questions added yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                                        {questions.map((question, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start">
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium h-5 w-5 rounded-full flex items-center justify-center mr-2 mt-1">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900 line-clamp-2">
                                                                {question.questionText}
                                                            </h3>
                                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                                <span className="capitalize">{question.questionType}</span>
                                                                <span className="mx-1">•</span>
                                                                <span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeQuestion(index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-6 flex flex-col space-y-3">
                                    <button
                                        onClick={saveQuestions}
                                        disabled={loading || questions.length === 0}
                                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center
                                            ${questions.length === 0 
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Questions
                                            </>
                                        )}
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate('/teacher-dashboard')}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddQuestions;
