import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamService from '../services/ExamService';
import { useAuth } from '../context/AuthContext';

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
        
        // For multiple choice, validate that at least one option is selected as correct
        if (currentQuestion.questionType === 'multiple-choice') {
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
        }
        
        // Add question to the list
        setQuestions(prev => [...prev, { ...currentQuestion }]);
        
        // Reset current question
        setCurrentQuestion({
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
            
            await ExamService.updateExamQuestions(examId, questions);
            navigate('/teacher-dashboard');
        } catch (err) {
            console.error('Error saving questions:', err);
            setError('Failed to save questions');
            setLoading(false);
        }
    };

    if (loading && !exam) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Add Questions to {exam?.title}
                </h1>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                
                {/* Question Form */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Question Text
                        </label>
                        <textarea
                            name="questionText"
                            value={currentQuestion.questionText}
                            onChange={handleQuestionChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="3"
                            placeholder="Enter your question here"
                        ></textarea>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Question Type
                        </label>
                        <select
                            name="questionType"
                            value={currentQuestion.questionType}
                            onChange={handleQuestionChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="short-answer">Short Answer</option>
                        </select>
                    </div>
                    
                    {currentQuestion.questionType === 'multiple-choice' && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Options
                            </label>
                            {currentQuestion.options.map((option, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        name="isCorrect"
                                        checked={option.isCorrect}
                                        onChange={(e) => handleOptionChange(index, e)}
                                        className="mr-2"
                                    />
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, { target: { name: 'text', value: e.target.value } })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder={`Option ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Points
                        </label>
                        <input
                            type="number"
                            name="points"
                            value={currentQuestion.points}
                            onChange={handleQuestionChange}
                            min="1"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Add Question
                    </button>
                </div>
                
                {/* Questions List */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Questions ({questions.length})
                    </h2>
                    
                    {questions.length === 0 ? (
                        <p className="text-gray-500">No questions added yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((question, index) => (
                                <div key={index} className="border p-4 rounded">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium">
                                            {index + 1}. {question.questionText}
                                        </h3>
                                        <button
                                            onClick={() => removeQuestion(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Type: {question.questionType} | Points: {question.points}
                                    </p>
                                    
                                    {question.questionType === 'multiple-choice' && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium">Options:</p>
                                            <ul className="list-disc pl-5">
                                                {question.options.map((option, optIndex) => (
                                                    <li key={optIndex} className={option.isCorrect ? 'text-green-600 font-medium' : ''}>
                                                        {option.text} {option.isCorrect && '(Correct)'}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between">
                    <button
                        onClick={() => navigate('/teacher-dashboard')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveQuestions}
                        disabled={loading || questions.length === 0}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        {loading ? 'Saving...' : 'Save Questions'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddQuestions;