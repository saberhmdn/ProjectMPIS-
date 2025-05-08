import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CourseService from '../services/CourseService';
import ExamService from '../services/ExamService';

const CreateExam = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        duration: 60,
        startTime: '',
        endTime: '',
        examType: type || 'mcq',
        questions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingCourses, setFetchingCourses] = useState(true);

    useEffect(() => {
        // Set exam type based on URL parameter
        setFormData(prev => ({
            ...prev,
            examType: type
        }));
        
        // Fetch teacher's courses for the dropdown
        const fetchCourses = async () => {
            try {
                setFetchingCourses(true);
                const coursesData = await CourseService.getTeacherCourses();
                setCourses(coursesData);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses. Please try again.');
            } finally {
                setFetchingCourses(false);
            }
        };
        
        fetchCourses();
    }, [type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            await ExamService.createExam(formData);
            navigate('/teacher-dashboard');
            
        } catch (err) {
            console.error('Error creating exam:', err);
            setError(err.response?.data?.message || 'Failed to create exam. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format date-time for input
    const formatDateTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    };

    return (
        <div className="create-exam-page">
            <div className="container">
                <h1>Create {type === 'mcq' ? 'Multiple Choice' : 'Written'} Exam</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Exam Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="courseId">Course *</label>
                        <select
                            id="courseId"
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleChange}
                            required
                            disabled={fetchingCourses}
                        >
                            <option value="">Select a course</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.courseName} ({course.courseCode})
                                </option>
                            ))}
                        </select>
                        {fetchingCourses && <div className="loading-text">Loading courses...</div>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration">Duration (minutes) *</label>
                            <input
                                type="number"
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                min="5"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="startTime">Start Time *</label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                name="startTime"
                                value={formatDateTime(formData.startTime)}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="endTime">End Time *</label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                name="endTime"
                                value={formatDateTime(formData.endTime)}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="questions-section">
                        <h2>Questions</h2>
                        <p className="info-text">
                            You can add questions after creating the exam.
                        </p>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => navigate('/teacher-dashboard')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Exam'}
                        </button>
                    </div>
                </form>
            </div>
            
            <style jsx>{`
                .create-exam-page {
                    padding: 20px;
                }
                
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                }
                
                h1 {
                    font-size: 1.8rem;
                    color: #333;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                
                h2 {
                    font-size: 1.4rem;
                    color: #444;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }
                
                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 10px 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    border-left: 4px solid #f5c6cb;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #555;
                }
                
                input, select, textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                
                textarea {
                    resize: vertical;
                }
                
                .loading-text {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 5px;
                }
                
                .info-text {
                    color: #666;
                    font-style: italic;
                }
                
                .questions-section {
                    margin-top: 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                    border: 1px dashed #ddd;
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 30px;
                }
                
                .cancel-btn {
                    background-color: #f5f5f5;
                    color: #333;
                    border: 1px solid #ddd;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .submit-btn {
                    background-color: ${type === 'mcq' ? '#2196F3' : '#9C27B0'};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                .submit-btn:hover {
                    background-color: ${type === 'mcq' ? '#0b7dda' : '#7B1FA2'};
                }
                
                .submit-btn:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
                
                @media (max-width: 768px) {
                    .container {
                        padding: 20px;
                    }
                    
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .form-actions {
                        flex-direction: column;
                    }
                    
                    .form-actions button {
                        width: 100%;
                        margin-bottom: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateExam;