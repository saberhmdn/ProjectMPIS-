# Exam Management System - Backend

A Node.js backend for an exam management system that allows teachers to create and manage exams, and students to take exams and view their results.

## Models

### 1. User Model
```javascript
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
    department: { type: String },
    createdAt: { type: Date, default: Date.now }
});
```

### 2. Exam Model
```javascript
const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    examType: { type: String, enum: ['mcq', 'written'], default: 'mcq' },
    isActive: { type: Boolean, default: true }
});
```

## Routes

### 1. Student Routes (/api/students)
- POST /register - Register a new student
- POST /login - Student login
- GET /profile - Get student profile (protected)

### 2. Teacher Routes (/api/teachers)
- POST /register - Register a new teacher
- POST /login - Teacher login
- GET /profile - Get teacher profile (protected)

### 3. Exam Routes (/api/exams)
- POST / - Create a new exam (protected)
- GET /teacher - Get all exams for a teacher (protected)
- GET /active - Get active exams for students (protected)
- GET /:examId - Get exam details (protected)
- POST /:examId/submit - Submit an exam (protected)
- GET /:examId/results - Get exam results (protected)
- PUT /:examId - Update an exam (protected)
- DELETE /:examId - Delete an exam (protected)

## Middleware
- auth.js - Authentication middleware to protect routes

## Security Features
1. Password hashing using bcrypt
2. JWT authentication
3. Protected routes
4. Input validation
5. Error handling

## Error Handling
All routes include try-catch blocks to handle errors and return appropriate status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Database
- MongoDB with Mongoose ODM
- Collections: users, exams, submissions
- Automatic collection creation
- Data validation
- Relationships between collections

## Setup Instructions
1. Install dependencies:
```bash
npm install
```

2. Create a .env file:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```bash
npm start
```

## API Documentation

### Authentication Endpoints
```javascript
// Register
POST /api/students/register
Body: {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    department: String
}

// Login
POST /api/students/login
Body: {
    email: String,
    password: String
}

// Get Profile
GET /api/students/profile
Headers: Authorization: Bearer <token>
```

### Teacher Endpoints
```javascript
// Register
POST /api/teachers/register
Body: {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    department: String,
    phoneNumber: String,
    subjects: [String]
}

// Login
POST /api/teachers/login
Body: {
    email: String,
    password: String
}

// Get Profile
GET /api/teachers/profile
Headers: Authorization: Bearer <token>
```

### Course Endpoints
```javascript
// Create Course
POST /api/courses
Headers: Authorization: Bearer <token>
Body: {
    title: String,
    description: String,
    code: String,
    credits: Number,
    department: String,
    prerequisites: [String]
}

// Get All Courses
GET /api/courses

// Get Specific Course
GET /api/courses/:id

// Update Course
PUT /api/courses/:id
Headers: Authorization: Bearer <token>
Body: {
    // Any course fields to update
}

// Delete Course
DELETE /api/courses/:id
Headers: Authorization: Bearer <token>
```

## Security Features
1. Password hashing using bcrypt
2. JWT authentication
3. Protected routes
4. Input validation
5. Error handling

## Error Handling
All routes include try-catch blocks to handle errors and return appropriate status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Database
- MongoDB with Mongoose ODM
- Collections: students, teachers, courses
- Automatic collection creation
- Data validation
- Relationships between collections

## Setup Instructions
1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```bash
npm start
```

## Testing
Use Postman or similar tools to test the API endpoints. Make sure to:
1. Get a JWT token by logging in
2. Include the token in Authorization header for protected routes
3. Follow the request body structure for each endpoint 
