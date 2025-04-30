const API_BASE_URL = 'https://api.educonnect.com/v1';

export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await response.json();
}

export async function fetchTeacherExams(token) {
    const response = await fetch(`${API_BASE_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
}