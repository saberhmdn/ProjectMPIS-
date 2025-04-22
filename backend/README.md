# Backend Documentation

## Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── config/          # Configuration files
└── server.js        # Main server file
```

## Models

### 1. Student Model
```javascript
const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    level: { type: Number, required: true },
    phoneNumber: { type: String }
});
```

### 2. Teacher Model
```javascript
const teacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    phoneNumber: { type: String },
    subjects: [{ type: String }]
});
```

### 3. Course Model
```javascript
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    credits: { type: Number, required: true },
    department: { type: String, required: true },
    prerequisites: [{ type: String }],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }
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

### 3. Course Routes (/api/courses)
- POST / - Create a new course (protected)
- GET / - Get all courses
- GET /:id - Get specific course
- PUT /:id - Update course (protected)
- DELETE /:id - Delete course (protected)

## Middleware

### 1. Authentication Middleware
```javascript
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};
```

## API Endpoints

### Student Endpoints
```javascript
// Register
POST /api/students/register
Body: {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    studentId: String,
    department: String,
    level: Number,
    phoneNumber: String
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