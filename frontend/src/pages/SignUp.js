import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student', // Default role
        // Common fields
        department: '',
        phoneNumber: '',
        // Student specific fields
        studentId: '',
        level: '',
        // Teacher specific fields
        subjects: '',
        isActive: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            // Common validation for all users
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.department) {
                setError('Please fill in all required fields');
                return;
            }
            
            if (formData.role === 'teacher') {
                // For teachers, validate teacher-specific fields
                if (!formData.subjects) {
                    setError('Please enter at least one subject');
                    return;
                }
                
                // Create teacher registration data matching backend model
                const teacherData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    department: formData.department,
                    phoneNumber: formData.phoneNumber || '',
                    subjects: formData.subjects.split(',').map(subject => subject.trim()),
                    isActive: true
                };
                
                console.log('Registering teacher:', teacherData);
                
                try {
                    const result = await register(teacherData, 'teacher');
                    console.log('Registration result:', result);
                    
                    setSuccess('Teacher registration successful! Redirecting to login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } catch (registerError) {
                    console.error('Teacher registration error:', registerError);
                    if (registerError.response && registerError.response.data) {
                        const missingFields = registerError.response.data.missingFields;
                        if (missingFields) {
                            const missingFieldNames = Object.keys(missingFields).filter(key => missingFields[key]);
                            setError(`Missing required fields: ${missingFieldNames.join(', ')}`);
                        } else {
                            setError(registerError.response.data.message || 'Registration failed');
                        }
                    } else {
                        setError('Registration failed. Please try again.');
                    }
                }
                
            } else {
                // For students, validate student-specific fields
                if (!formData.studentId) {
                    setError('Student ID is required');
                    return;
                }
                if (!formData.level) {
                    setError('Level is required');
                    return;
                }
                
                // Create student registration data matching backend model
                const studentData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    studentId: formData.studentId,
                    department: formData.department,
                    level: parseInt(formData.level),
                    phoneNumber: formData.phoneNumber || ''
                };
                
                console.log('Registering student:', studentData);
                
                try {
                    const result = await register(studentData, 'student');
                    console.log('Registration result:', result);
                    
                    setSuccess('Student registration successful! Redirecting to login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } catch (registerError) {
                    console.error('Student registration error:', registerError);
                    if (registerError.response && registerError.response.data) {
                        const missingFields = registerError.response.data.missingFields;
                        if (missingFields) {
                            const missingFieldNames = Object.keys(missingFields).filter(key => missingFields[key]);
                            setError(`Missing required fields: ${missingFieldNames.join(', ')}`);
                        } else {
                            setError(registerError.response.data.message || 'Registration failed');
                        }
                    } else {
                        setError('Registration failed. Please try again.');
                    }
                }
            }
        } catch (err) {
            console.error('Form submission error:', err);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            sign in to your account
                        </Link>
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="firstName" className="sr-only">First Name</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="sr-only">Last Name</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Role selection */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>

                        {/* Department field (common for both roles) */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter department"
                                required
                            />
                        </div>

                        {/* Phone Number (common for both roles) */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter phone number"
                            />
                        </div>

                        {/* Conditional rendering based on role */}
                        {formData.role === 'student' ? (
                            <>
                                {/* Student-specific fields */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Student ID</label>
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Enter student ID"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Level</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    >
                                        <option value="">Select Level</option>
                                        <option value="1">Level 1</option>
                                        <option value="2">Level 2</option>
                                        <option value="3">Level 3</option>
                                        <option value="4">Level 4</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Teacher-specific fields */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Subjects</label>
                                    <input
                                        type="text"
                                        name="subjects"
                                        value={formData.subjects}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="Enter subjects (comma separated)"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Separate multiple subjects with commas</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
