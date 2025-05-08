import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/api/exams`;

class ExamService {
    // Get all exams for a teacher
    async getTeacherExams() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/teacher`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Create a new exam
    async createExam(examData) {
        const token = localStorage.getItem('token');
        const response = await axios.post(API_URL, examData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Get a specific exam by ID
    async getExamById(examId) {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/${examId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Update an exam
    async updateExam(examId, examData) {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/${examId}`, examData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Delete an exam
    async deleteExam(examId) {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/${examId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Add a question to an exam
    async addQuestion(examId, questionData) {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/${examId}/questions`, questionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}

export default new ExamService();