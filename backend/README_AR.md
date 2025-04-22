# توثيق الباك إند

## هيكل المشروع
```
backend/
├── models/          # نماذج قاعدة البيانات
├── routes/          # مسارات API
├── middleware/      # البرمجيات الوسيطة المخصصة
├── config/          # ملفات التكوين
└── server.js        # الملف الرئيسي للخادم
```

## النماذج

### 1. نموذج الطالب
```javascript
const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },      // الاسم الأول
    lastName: { type: String, required: true, trim: true },       // الاسم الأخير
    email: { type: String, required: true, unique: true, trim: true }, // البريد الإلكتروني
    password: { type: String, required: true },                   // كلمة المرور
    studentId: { type: String, required: true, unique: true },    // رقم الطالب
    department: { type: String, required: true },                 // القسم
    level: { type: Number, required: true },                      // المستوى
    phoneNumber: { type: String }                                // رقم الهاتف
});
```

### 2. نموذج المعلم
```javascript
const teacherSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },      // الاسم الأول
    lastName: { type: String, required: true, trim: true },       // الاسم الأخير
    email: { type: String, required: true, unique: true, trim: true }, // البريد الإلكتروني
    password: { type: String, required: true },                   // كلمة المرور
    department: { type: String, required: true },                 // القسم
    phoneNumber: { type: String },                               // رقم الهاتف
    subjects: [{ type: String }]                                 // المواد
});
```

### 3. نموذج المادة
```javascript
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },                      // عنوان المادة
    description: { type: String, required: true },                // وصف المادة
    code: { type: String, required: true },                       // رمز المادة
    credits: { type: Number, required: true },                    // عدد الساعات
    department: { type: String, required: true },                 // القسم
    prerequisites: [{ type: String }],                           // المتطلبات السابقة
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true } // المعلم
});
```

## المسارات

### 1. مسارات الطالب (/api/students)
- POST /register - تسجيل طالب جديد
- POST /login - تسجيل دخول الطالب
- GET /profile - الحصول على ملف الطالب (محمي)

### 2. مسارات المعلم (/api/teachers)
- POST /register - تسجيل معلم جديد
- POST /login - تسجيل دخول المعلم
- GET /profile - الحصول على ملف المعلم (محمي)

### 3. مسارات المادة (/api/courses)
- POST / - إنشاء مادة جديدة (محمي)
- GET / - الحصول على جميع المواد
- GET /:id - الحصول على مادة محددة
- PUT /:id - تحديث المادة (محمي)
- DELETE /:id - حذف المادة (محمي)

## البرمجيات الوسيطة

### 1. برمجية المصادقة
```javascript
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'يرجى المصادقة' });
    }
};
```

## نقاط نهاية API

### نقاط نهاية الطالب
```javascript
// التسجيل
POST /api/students/register
Body: {
    firstName: String,    // الاسم الأول
    lastName: String,     // الاسم الأخير
    email: String,        // البريد الإلكتروني
    password: String,     // كلمة المرور
    studentId: String,    // رقم الطالب
    department: String,   // القسم
    level: Number,        // المستوى
    phoneNumber: String   // رقم الهاتف
}

// تسجيل الدخول
POST /api/students/login
Body: {
    email: String,        // البريد الإلكتروني
    password: String      // كلمة المرور
}

// الحصول على الملف الشخصي
GET /api/students/profile
Headers: Authorization: Bearer <token>
```

### نقاط نهاية المعلم
```javascript
// التسجيل
POST /api/teachers/register
Body: {
    firstName: String,    // الاسم الأول
    lastName: String,     // الاسم الأخير
    email: String,        // البريد الإلكتروني
    password: String,     // كلمة المرور
    department: String,   // القسم
    phoneNumber: String,  // رقم الهاتف
    subjects: [String]    // المواد
}

// تسجيل الدخول
POST /api/teachers/login
Body: {
    email: String,        // البريد الإلكتروني
    password: String      // كلمة المرور
}

// الحصول على الملف الشخصي
GET /api/teachers/profile
Headers: Authorization: Bearer <token>
```

### نقاط نهاية المادة
```javascript
// إنشاء مادة
POST /api/courses
Headers: Authorization: Bearer <token>
Body: {
    title: String,        // عنوان المادة
    description: String,  // وصف المادة
    code: String,         // رمز المادة
    credits: Number,      // عدد الساعات
    department: String,   // القسم
    prerequisites: [String] // المتطلبات السابقة
}

// الحصول على جميع المواد
GET /api/courses

// الحصول على مادة محددة
GET /api/courses/:id

// تحديث المادة
PUT /api/courses/:id
Headers: Authorization: Bearer <token>
Body: {
    // أي حقول المادة للتحديث
}

// حذف المادة
DELETE /api/courses/:id
Headers: Authorization: Bearer <token>
```

## ميزات الأمان
1. تشفير كلمات المرور باستخدام bcrypt
2. المصادقة باستخدام JWT
3. المسارات المحمية
4. التحقق من صحة المدخلات
5. معالجة الأخطاء

## معالجة الأخطاء
جميع المسارات تتضمن كتل try-catch لمعالجة الأخطاء وإرجاع رموز الحالة المناسبة:
- 200: نجاح
- 201: تم الإنشاء
- 400: طلب غير صالح
- 401: غير مصرح
- 403: ممنوع
- 404: غير موجود
- 500: خطأ في الخادم

## قاعدة البيانات
- MongoDB مع Mongoose ODM
- المجموعات: الطلاب، المعلمون، المواد
- إنشاء المجموعات تلقائياً
- التحقق من صحة البيانات
- العلاقات بين المجموعات

## تعليمات الإعداد
1. تثبيت التبعيات:
```bash
npm install
```

2. إنشاء ملف .env:
```env
PORT=5000
MONGODB_URI=رابط_قاعدة_البيانات
JWT_SECRET=مفتاح_التشفير
```

3. تشغيل الخادم:
```bash
npm start
```

## الاختبار
استخدم Postman أو أدوات مماثلة لاختبار نقاط نهاية API. تأكد من:
1. الحصول على رمز JWT عن طريق تسجيل الدخول
2. تضمين الرمز في رأس Authorization للمسارات المحمية
3. اتباع هيكل طلب الجسم لكل نقطة نهاية 