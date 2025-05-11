import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExamService from '../services/ExamService';

const TakeExam = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchExam = async () => {
            try {
                setLoading(true);
                const examData = await ExamService.getExamById(examId);
                setExam(examData);
                
                const initialAnswers = {};
                if (examData.questions && examData.questions.length > 0) {
                    examData.questions.forEach((question, index) => {
                        initialAnswers[index] = '';
                    });
                }
                setAnswers(initialAnswers);
                
                const endTime = new Date(examData.endTime).getTime();
                const now = new Date().getTime();
                const duration = Math.floor((endTime - now) / 1000);
                setTimeLeft(duration > 0 ? duration : 0);
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching exam:', err);
                setError('Failed to load exam. Please try again.');
                setLoading(false);
            }
        };

        fetchExam();
    }, [examId, navigate, user]);

    useEffect(() => {
        if (!timeLeft || timeLeft <= 0) return;

        const timerId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
            
            if (timeLeft <= 1) {
                handleSubmit();
                clearInterval(timerId);
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    useEffect(() => {
        if (exam && exam.questions) {
            const answeredCount = Object.values(answers).filter(answer => answer !== '').length;
            const percentage = Math.round((answeredCount / exam.questions.length) * 100);
            setProgress(percentage);
        }
    }, [answers, exam]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionIndex, value) => {
        setAnswers({
            ...answers,
            [questionIndex]: value
        });
    };

    const handleSubmit = async () => {
        if (submitted) return;
        
        try {
            setLoading(true);
            setSubmitted(true);
            
            // Format the answers with the required structure
            const formattedAnswers = Object.keys(answers).map(index => {
                const question = exam.questions[index];
                return {
                    questionId: question._id,
                    selectedAnswer: question.type === 'multiple-choice' ? answers[index] : undefined,
                    writtenAnswer: question.type !== 'multiple-choice' ? answers[index] : undefined
                };
            });

            // Include the student ID explicitly in the payload
            const payload = {
                answers: formattedAnswers
            };

            console.log('Submitting with payload:', payload);
            
            await ExamService.submitExam(examId, payload);
            
            navigate('/student-dashboard', { state: { message: 'Exam submitted successfully!' } });
        } catch (err) {
            console.error('Error submitting exam:', err);
            setError('Failed to submit exam. Please try again.');
            setSubmitted(false);
            setLoading(false);
        }
    };

    const goToNextQuestion = () => {
        if (currentQuestion < exam.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    if (loading && !exam) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700 text-lg">Loading exam...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Not Found</h2>
                    <p className="text-gray-700">The exam you're looking for doesn't exist or you don't have permission to access it.</p>
                    <button
                        onClick={() => navigate('/student-dashboard')}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Exam?</h3>
                        <p className="text-gray-600 mb-6">
                            You have answered {Object.values(answers).filter(a => a !== '').length} out of {exam.questions.length} questions. 
                            Are you sure you want to submit your exam?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white"
                            >
                                Submit Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with timer and progress */}
            <div className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <button 
                                onClick={() => navigate('/student-dashboard')}
                                className="mr-3 text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 truncate">{exam.title}</h1>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="text-sm text-gray-600">{progress}% Complete</span>
                            </div>
                            
                            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                timeLeft < 300 
                                    ? 'bg-red-100 text-red-800' 
                                    : timeLeft < 600 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-indigo-100 text-indigo-800'
                            }`}>
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="h-1 w-full bg-gray-200">
                    <div 
                        className="h-1 bg-indigo-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {submitted ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted</h2>
                        <p className="text-gray-600 mb-6">Your answers have been recorded successfully.</p>
                        <button
                            onClick={() => navigate('/student-dashboard')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Question navigation sidebar */}
                        <div className="lg:w-72 bg-white p-5 rounded-lg shadow-md h-fit">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                                <span className="text-sm text-gray-500">{Object.values(answers).filter(a => a !== '').length}/{exam.questions.length} answered</span>
                            </div>
                            
                            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-6">
                                {exam.questions && exam.questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`h-10 w-10 rounded-md flex items-center justify-center font-medium text-sm transition-all
                                            ${currentQuestion === index 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : answers[index] 
                                                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300' 
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-4 h-4 bg-indigo-600 rounded-sm mr-2"></div>
                                    <span>Current question</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-300 rounded-sm mr-2"></div>
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-4 h-4 bg-gray-100 rounded-sm mr-2"></div>
                                    <span>Unanswered</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Submit Exam
                                </button>
                            </div>
                        </div>
                        
                        {/* Main question area */}
                        <div className="flex-1">
                            {exam.questions && exam.questions.length > 0 && (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center">
                                                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                                                    Question {currentQuestion + 1}/{exam.questions.length}
                                                </span>
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {exam.questions[currentQuestion].points || 1} {exam.questions[currentQuestion].points === 1 ? 'point' : 'points'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {exam.questions[currentQuestion].questionType || 'multiple-choice'}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {exam.questions[currentQuestion].questionText || exam.questions[currentQuestion].text}
                                        </h2>
                                    </div>
                                    
                                    {/* Multiple choice options */}
                                    {(exam.questions[currentQuestion].questionType === 'multiple-choice' || !exam.questions[currentQuestion].questionType) && (
                                        <div className="space-y-3">
                                            {exam.questions[currentQuestion].options && exam.questions[currentQuestion].options.map((option, optionIndex) => (
                                                <div 
                                                    key={optionIndex}
                                                    onClick={() => handleAnswerChange(currentQuestion, optionIndex.toString())}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all
                                                        ${answers[currentQuestion] === optionIndex.toString()
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center
                                                            ${answers[currentQuestion] === optionIndex.toString()
                                                                ? 'border-indigo-600 bg-indigo-600'
                                                                : 'border-gray-300'
                                                            }`}
                                                        >
                                                            {answers[currentQuestion] === optionIndex.toString() && (
                                                                <span className="h-2 w-2 rounded-full bg-white"></span>
                                                            )}
                                                        </div>
                                                        <span className="ml-3 text-gray-800">
                                                            {typeof option === 'object' ? option.text : option}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* True/False options */}
                                    {exam.questions[currentQuestion].questionType === 'true-false' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div 
                                                onClick={() => handleAnswerChange(currentQuestion, 'true')}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all
                                                    ${answers[currentQuestion] === 'true'
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center
                                                        ${answers[currentQuestion] === 'true'
                                                            ? 'border-indigo-600 bg-indigo-600'
                                                            : 'border-gray-300'
                                                        }`}
                                                    >
                                                        {answers[currentQuestion] === 'true' && (
                                                            <span className="h-2 w-2 rounded-full bg-white"></span>
                                                        )}
                                                    </div>
                                                    <span className="ml-3 text-gray-800">True</span>
                                                </div>
                                            </div>
                                            <div 
                                                onClick={() => handleAnswerChange(currentQuestion, 'false')}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all
                                                    ${answers[currentQuestion] === 'false'
                                                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center
                                                        ${answers[currentQuestion] === 'false'
                                                            ? 'border-indigo-600 bg-indigo-600'
                                                            : 'border-gray-300'
                                                        }`}
                                                    >
                                                        {answers[currentQuestion] === 'false' && (
                                                            <span className="h-2 w-2 rounded-full bg-white"></span>
                                                        )}
                                                    </div>
                                                    <span className="ml-3 text-gray-800">False</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Navigation buttons */}
                                    <div className="mt-8 flex justify-between">
                                        <button
                                            onClick={goToPreviousQuestion}
                                            disabled={currentQuestion === 0}
                                            className={`px-4 py-2 rounded-md flex items-center ${
                                                currentQuestion === 0
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            }`}
                                        >
                                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        
                                        <button
                                            onClick={goToNextQuestion}
                                            disabled={currentQuestion === exam.questions.length - 1}
                                            className={`px-4 py-2 rounded-md flex items-center ${
                                                currentQuestion === exam.questions.length - 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                        >
                                            Next
                                            <svg className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TakeExam;





