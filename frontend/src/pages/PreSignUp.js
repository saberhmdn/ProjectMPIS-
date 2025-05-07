import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PreSignUp = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/register', { state: { role: selectedRole } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join Our Platform
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose how you want to use our platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Select your role</h3>
              <p className="mt-1 text-sm text-gray-500">
                This will determine what features you'll have access to
              </p>
            </div>

            <div className="space-y-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === 'student' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
                onClick={() => handleRoleSelect('student')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    selectedRole === 'student' 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-gray-400'
                  }`}>
                    {selectedRole === 'student' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Student</h4>
                    <p className="text-sm text-gray-500">Take exams, view grades, and track your progress</p>
                  </div>
                </div>
              </div>

              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === 'teacher' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
                onClick={() => handleRoleSelect('teacher')}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border ${
                    selectedRole === 'teacher' 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-gray-400'
                  }`}>
                    {selectedRole === 'teacher' && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-medium text-gray-900">Teacher</h4>
                    <p className="text-sm text-gray-500">Create exams, grade students, and manage courses</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleContinue}
                disabled={!selectedRole}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedRole 
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                    : 'bg-indigo-300 cursor-not-allowed'
                }`}
              >
                Continue to Registration
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreSignUp;