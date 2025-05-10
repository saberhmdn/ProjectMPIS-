import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExamService from '../services/ExamService';

const ExamResults = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const viewSubmissionDetails = (submissionId) => {
        navigate(`/submission/${submissionId}`);
    };

    const exportResults = (format) => {
        if (format === 'pdf') {
            // PDF export logic
            console.log('Exporting results as PDF');
            // You would implement actual PDF generation here
            // For example using jsPDF or a backend API call
            alert('PDF export functionality will be implemented soon');
        } else if (format === 'csv') {
            // CSV export logic
            console.log('Exporting results as CSV');
            
            if (!results || !results.submissions) {
                alert('No data to export');
                return;
            }
            
            // Create CSV content
            const headers = ['Student Name', 'Email', 'Score', 'Status', 'Submission Time'];
            const csvRows = [headers];
            
            results.submissions.forEach(submission => {
                const studentName = `${submission.student?.firstName || ''} ${submission.student?.lastName || ''}`;
                const row = [
                    studentName.trim(),
                    submission.student?.email || '',
                    `${submission.totalScore}/${submission.maxScore}`,
                    submission.isPassed ? 'Passed' : 'Failed',
                    submission.submittedAt || ''
                ];
                csvRows.push(row);
            });
            
            // Convert to CSV string
            const csvContent = csvRows.map(row => row.join(',')).join('\n');
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${results.examTitle}_results.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

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

        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await ExamService.getExamResults(examId);
                console.log('Exam results data:', data);
                
                // Ensure statistics object exists
                if (!data.statistics) {
                    data.statistics = {
                        passed: 0,
                        failed: 0,
                        notSubmitted: 0,
                        passRate: '0%'
                    };
                }
                
                // Ensure submissions array exists
                if (!data.submissions) {
                    data.submissions = [];
                }
                
                setResults(data);
                setError('');
            } catch (err) {
                console.error('Error fetching results:', err);
                setError('Failed to load exam results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [examId, navigate, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                <span className="ml-3 text-gray-700">Loading results...</span>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h2 className="mt-2 text-xl font-bold text-gray-800">No Results</h2>
                    <p className="mt-1 text-gray-500">No results found for this exam.</p>
                    <button
                        onClick={() => navigate('/teacher-dashboard')}
                        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Ensure statistics object exists
    const statistics = results.statistics || {
        passed: 0,
        failed: 0,
        notSubmitted: 0,
        passRate: '0%'
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-accent-100 mx-auto"></div>
                    <p className="mt-6 text-dark-300 font-medium">Loading exam results...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg text-red-700 my-6">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            ) : !results ? (
                <div className="bg-light-200 p-8 rounded-lg text-center shadow-md">
                    <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-dark-400 text-lg">No results available for this exam.</p>
                </div>
            ) : (
                <>
                    {/* Header with exam info */}
                    <div className="bg-gradient-to-r from-accent-100 to-accent-300 text-white rounded-lg shadow-md p-6 mb-8">
                        <h1 className="text-2xl font-bold mb-2">{results.examTitle}</h1>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{results.examDate}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{results.duration} minutes</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="h-5 w-5 mr-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>{results.totalStudents} students</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Statistics cards */}
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-4 text-dark-100">Performance Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-green-500 h-2"></div>
                                <div className="p-5">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Passed</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-bold text-green-600">{results.statistics.passed}</p>
                                        <p className="text-sm text-gray-500">students</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-red-500 h-2"></div>
                                <div className="p-5">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Failed</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-bold text-red-600">{results.statistics.failed}</p>
                                        <p className="text-sm text-gray-500">students</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-500 h-2"></div>
                                <div className="p-5">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Not Submitted</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-bold text-gray-600">{results.statistics.notSubmitted}</p>
                                        <p className="text-sm text-gray-500">students</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-blue-500 h-2"></div>
                                <div className="p-5">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Pass Rate</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-3xl font-bold text-blue-600">{results.statistics.passRate}</p>
                                        <p className="text-sm text-gray-500">overall</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Submissions table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-dark-100">Student Submissions</h2>
                        </div>
                        
                        {results.submissions && results.submissions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Time</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {results.submissions.map((submission, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-accent-100 rounded-full flex items-center justify-center text-white font-medium">
                                                            {submission.student?.firstName?.[0]}{submission.student?.lastName?.[0]}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{submission.student?.firstName} {submission.student?.lastName}</div>
                                                            <div className="text-sm text-gray-500">{submission.student?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium">{submission.totalScore}/{submission.maxScore}</div>
                                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
                                                        <div 
                                                            className={`h-2.5 rounded-full ${submission.isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                                                            style={{ width: `${(submission.totalScore / submission.maxScore) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        submission.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {submission.isPassed ? 'Passed' : 'Failed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {submission.submittedAt}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => viewSubmissionDetails(submission.id)}
                                                        className="text-accent-100 hover:text-accent-200 transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500">No submissions available for this exam.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Export buttons */}
                    <div className="flex justify-end space-x-4">
                        <button 
                            onClick={() => exportResults('pdf')}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Export as PDF
                        </button>
                        <button 
                            onClick={() => exportResults('csv')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export as CSV
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExamResults;







