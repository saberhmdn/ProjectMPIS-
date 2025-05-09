// Import routes
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/auth', authRoutes);

