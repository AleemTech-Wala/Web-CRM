# API Routes & Endpoints - Creating Your Digital Services 📡

Think of API routes as **different service counters** in a bank - each counter handles specific tasks like deposits, withdrawals, or account opening!

## 🤔 What are API Routes?

API routes are like **specialized departments** in a company:
- **Registration Department** = `/api/auth/register` (creates new accounts)
- **Login Department** = `/api/auth/login` (verifies credentials)
- **Profile Department** = `/api/user/profile` (manages user info)
- **Support Department** = `/api/support/tickets` (handles help requests)

## 🏗️ Route Structure

```
Backend Server
├── Main Door (server.js)
├── Registration Dept (/api/auth/register)
├── Login Dept (/api/auth/login)
├── Profile Dept (/api/user/profile)
└── Support Dept (/api/support/tickets)
```

## 📄 Our Registration Route Explained

Let's break down `routes/auth.js` step by step:

### Step 1: Setup Route Handler 🛠️

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const router = express.Router();
```

**What each tool does:**
- **express.Router()** = Creates mini-app for auth routes
- **bcrypt** = Password encryption tool
- **pool** = Database connection manager
- **router** = Route organizer (like department manager)

### Step 2: Registration Endpoint 📝

```javascript
router.post('/register', async (req, res) => {
    // This handles POST requests to /api/auth/register
});
```

**Route anatomy:**
- **router.post** = Handles POST method (for creating new data)
- **'/register'** = The endpoint path (combined becomes `/api/auth/register`)
- **async (req, res)** = Function that handles the request

## 🔍 Request Processing Flow

```
Frontend → POST /api/auth/register → Validation → Database → Response → Frontend
   📱            📡                    ✅         🗄️        📤         📱
```

### Step 3: Getting Data from Frontend 📥

```javascript
const { email, password, name } = req.body;
```

**req.body** contains data sent from frontend:
```javascript
// What frontend sends:
{
    "email": "john@company.com",
    "password": "MySecure123",
    "name": "John Doe"
}
```

**Destructuring explained:**
```javascript
// Long way:
const email = req.body.email;
const password = req.body.password;
const name = req.body.name;

// Short way (destructuring):
const { email, password, name } = req.body;
```

### Step 4: Input Validation 🛡️

```javascript
// 1. Check required fields
if (!email || !password) {
    return res.status(400).json({
        success: false,
        message: 'Email and password are required'
    });
}

// 2. Email format validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
    });
}

// 3. Password strength validation
if (password.length < 8) {
    return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
    });
}

if (!/\d/.test(password)) {
    return res.status(400).json({
        success: false,
        message: 'Password must include at least one number'
    });
}
```

**Validation explained:**
- **Required fields** = Like checking if form is completely filled
- **Email regex** = Pattern matching for valid email format
- **Password rules** = Enforcing security requirements

### Step 5: Database Operations 🗄️

```javascript
// Check if email already exists
const connection = await pool.getConnection();
const [existingUsers] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
);

if (existingUsers.length > 0) {
    connection.release();
    return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
    });
}
```

**What happens here:**
1. **Get connection** = Borrow database key
2. **Query database** = Check if email exists
3. **Check results** = If found, email is already taken
4. **Release connection** = Return key to pool
5. **Send error** = Tell frontend email is taken

### Step 6: Password Encryption 🔒

```javascript
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Password hashing process:**
```
Original Password: "MySecure123"
        ↓
Add Random Salt: "MySecure123" + "randomSalt123"
        ↓
Hash Algorithm: SHA-256 + bcrypt
        ↓
Final Result: "$2b$10$abcdef1234567890..."
```

**Why hash passwords?**
- **Security** = Even if database is stolen, passwords are unreadable
- **Irreversible** = Can't convert hash back to original password
- **Unique** = Same password creates different hash each time (due to salt)

### Step 7: Save to Database 💾

```javascript
const [result] = await connection.execute(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name || null]
);

connection.release();
```

**SQL breakdown:**
- **INSERT INTO users** = Add new row to users table
- **(email, password, name)** = Which columns to fill
- **VALUES (?, ?, ?)** = Placeholders for safe data insertion
- **[email, hashedPassword, name]** = Actual values to insert

### Step 8: Success Response 🎉

```javascript
res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    user: {
        id: result.insertId,
        email: email,
        name: name || null,
        created_at: new Date().toISOString()
    }
});
```

**Response structure:**
- **status(201)** = "Created" status code
- **success: true** = Indicates operation succeeded
- **message** = Human-readable success message
- **user** = New user information (WITHOUT password!)

## 🔄 Complete Request-Response Cycle

### Frontend Request:
```javascript
fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'john@company.com',
        password: 'MySecure123',
        name: 'John Doe'
    })
})
```

### Backend Processing:
1. ✅ Receive request at `/api/auth/register`
2. ✅ Extract data from `req.body`
3. ✅ Validate email format and password strength
4. ✅ Check if email already exists in database
5. ✅ Hash password with bcrypt
6. ✅ Save new user to database
7. ✅ Return success response

### Backend Response:
```javascript
{
    "success": true,
    "message": "Account created successfully!",
    "user": {
        "id": 15,
        "email": "john@company.com",
        "name": "John Doe",
        "created_at": "2025-01-15T10:30:00.000Z"
    }
}
```

## 🎯 HTTP Status Codes Explained

| Code | Meaning | When to Use | Example |
|------|---------|-------------|---------|
| **200** | OK | Successful GET request | Getting user profile |
| **201** | Created | Successfully created new resource | User registered |
| **400** | Bad Request | Invalid input data | Missing email field |
| **401** | Unauthorized | Authentication required | Login needed |
| **409** | Conflict | Resource already exists | Email already taken |
| **500** | Server Error | Something broke on our end | Database crashed |

## 🧪 Additional Endpoint Example

### Email Check Endpoint:
```javascript
router.get('/check-email/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const connection = await pool.getConnection();
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        connection.release();
        
        res.json({
            exists: users.length > 0
        });
        
    } catch (error) {
        console.error('❌ Email check error:', error);
        res.status(500).json({
            exists: false,
            error: 'Unable to check email'
        });
    }
});
```

**Usage from frontend:**
```javascript
// Check if email exists before registration
const checkEmail = async (email) => {
    const response = await fetch(`http://localhost:5000/api/auth/check-email/${email}`);
    const result = await response.json();
    return result.exists; // true or false
};
```

## 🛡️ Error Handling Best Practices

### 1. Try-Catch Blocks ✅
```javascript
router.post('/register', async (req, res) => {
    try {
        // All your registration logic here
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});
```

### 2. Specific Error Messages ✅
```javascript
// Database errors
if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
    });
}

// Connection errors  
if (error.code === 'ECONNREFUSED') {
    return res.status(500).json({
        success: false,
        message: 'Database connection failed'
    });
}
```

### 3. Input Sanitization ✅
```javascript
// Clean and validate input
const email = req.body.email?.toString().trim().toLowerCase();
const name = req.body.name?.toString().trim();

// Check for empty strings after trimming
if (!email || !name) {
    return res.status(400).json({
        success: false,
        message: 'Please provide valid email and name'
    });
}
```

## 🔒 Security Considerations

### 1. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 registration attempts per 15 minutes
    message: 'Too many registration attempts, please try again later.'
});

router.post('/register', registerLimiter, async (req, res) => {
    // Registration logic
});
```

### 2. Input Validation Library
```javascript
const { body, validationResult } = require('express-validator');

router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/\d/),
    body('name').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    // Registration logic
});
```

## 🎯 Route Organization

### File Structure:
```
routes/
├── auth.js          # Registration, login, logout
├── users.js         # User profile management
├── customers.js     # Customer operations
├── orders.js        # Order management
└── reports.js       # Analytics and reporting
```

### Main Server Routes:
```javascript
// server.js
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reports', require('./routes/reports'));
```

## 🧪 Testing Your API Routes

### Using curl:
```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'

# Test email check
curl http://localhost:5000/api/auth/check-email/test@example.com
```

### Using Postman:
1. Create new POST request
2. URL: `http://localhost:5000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
}
```

## 🎯 Quick Quiz

1. What's the difference between `req.body` and `req.params`?
2. Why do we use status codes in API responses?
3. What happens if you don't release a database connection?
4. Why hash passwords instead of storing them directly?

## 🚀 Next Steps

Now that you understand API routes, let's dive deeper into password security!

*Next: [Password Security & Hashing](./06-password-security.md)*

---

**Key Takeaway:** API routes are like service departments in a company - each one specializes in handling specific types of requests and provides appropriate responses! 🏢📡
