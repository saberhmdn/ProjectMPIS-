import axios from 'axios';
import config from '../config';

const API_URL = `${config.API_BASE_URL}/api/courses`;

class CourseService {
    // Get all courses for a teacher
    async getTeacherCourses() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/my-courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Create a new course
    async createCourse(courseData) {
        const token = localStorage.getItem('token');
        const response = await axios.post(API_URL, courseData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Get a specific course by ID
    async getCourseById(courseId) {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Update a course
    async updateCourse(courseId, courseData) {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/${courseId}`, courseData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }

    // Delete a course
    async deleteCourse(courseId) {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${API_URL}/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
}

export default new CourseService();



