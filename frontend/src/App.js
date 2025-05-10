import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import PreSignUp from './pages/PreSignUp';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateExam from './pages/CreateExam';
import AddQuestions from './pages/AddQuestions';
import TakeExam from './pages/TakeExam';
import ProtectedRoute from './components/ProtectedRoute';
import ExamDetails from './pages/ExamDetails';
import EditExam from './pages/EditExam';
import ExamResults from './pages/ExamResults';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pre-signup" element={<PreSignUp />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-exam" 
              element={
                <ProtectedRoute>
                  <CreateExam />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-questions/:examId" 
              element={
                <ProtectedRoute>
                  <AddQuestions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/take-exam/:examId" 
              element={
                <ProtectedRoute>
                  <TakeExam />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exam/:examId" 
              element={
                <ProtectedRoute>
                  <ExamDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-exam/:examId" 
              element={
                <ProtectedRoute>
                  <EditExam />
                </ProtectedRoute>
              } 
            />
            <Route path="/exam/:examId/results" element={<ExamResults />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 
