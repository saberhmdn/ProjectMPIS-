// This file is for testing purposes only
// It creates mock API handlers for MSW (Mock Service Worker)
// You can use this for development if your backend is not ready

import { rest } from 'msw';

const API_URL = 'http://localhost:5001';

export const handlers = [
  // Course endpoints
  rest.get(`${API_URL}/api/courses/my-courses`, (req, res, ctx) => {
    // Check for auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
    }
    
    // Return mock courses
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          courseName: 'Introduction to Computer Science',
          courseCode: 'CS101',
          description: 'An introductory course to computer science',
          department: 'Computer Science',
          level: 1,
          teacherId: '123'
        },
        {
          id: '2',
          courseName: 'Data Structures',
          courseCode: 'CS201',
          description: 'A course on data structures and algorithms',
          department: 'Computer Science',
          level: 2,
          teacherId: '123'
        }
      ])
    );
  }),
  
  rest.post(`${API_URL}/api/courses`, async (req, res, ctx) => {
    // Check for auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
    }
    
    // Get request body
    const courseData = await req.json();
    
    // Validate required fields
    if (!courseData.courseName || !courseData.courseCode) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Course name and code are required' })
      );
    }
    
    // Return created course with an ID
    return res(
      ctx.status(201),
      ctx.json({
        id: Math.random().toString(36).substr(2, 9),
        ...courseData,
        teacherId: '123',
        createdAt: new Date().toISOString()
      })
    );
  }),
  
  // Add more mock handlers as needed
];