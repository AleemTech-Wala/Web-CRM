# Server Setup with Express - The Heart of Backend 🌐

Think of `server.js` as the **main entrance** to your digital restaurant. Every customer (frontend request) comes through this door!

## 🤔 What is a Server?

A server is like a **restaurant**:
- **Customers** = Frontend requests (from React app)
- **Waiters** = Routes (handle different requests)
- **Kitchen** = Your business logic (registration, login, etc.)
- **Storage** = Database (where data is kept)

## 📄 Our Server.js Step by Step

Let's build our server piece by piece, like assembling LEGO blocks!

### Step 1: Import the Tools 🛠️

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection, initializeDatabase } = require('./config/database');
require('dotenv').config();
```

**What each tool does:**
- `express` = The restaurant building (framework)
- `cors` = The bridge connecting frontend to backend
- `bodyParser` = The translator (converts JSON to JavaScript)
- `database` = Functions to connect to our storage room
- `dotenv` = Loads our secret environment variables

**Real analogy:** Like gathering all tools before starting to cook!

### Step 2: Create the Restaurant 🏢

```javascript
const app = express();
const PORT = process.env.PORT || 5000;
```

**Explanation:**
- `app` = Our restaurant instance
- `PORT` = The address number (5000 is like street address)
- `process.env.PORT` = Check if we have a custom address in .env file
- `|| 5000` = If no custom address, use 5000 as default

**Analogy:** Like deciding where to build your restaurant!

### Step 3: Set Up the Waiters (Middleware) 👨‍💼

```javascript
app.use(cors());           // Allow frontend to connect
app.use(bodyParser.json()); // Understand JSON requests
app.use(express.json());    // Built-in JSON parser (backup)
```

**What is Middleware?**
Middleware = Functions that run BEFORE your main logic

Think of it like **security guards** at a mall:
1. **CORS guard** = Checks if frontend is allowed to enter
2. **BodyParser guard** = Translates foreign language (JSON) to English
3. **Express JSON guard** = Backup translator

**Visual flow:**
```
Frontend Request → CORS → BodyParser → Express JSON → Your Route Handler
```

### Step 4: Create Welcome Door 🚪

```javascript
app.get('/', (req, res) => {
    res.json({ 
        message: 'CRM Backend API is running!',
        version: '1.0.0',
        status: 'active'
    });
});
```

**Breaking it down:**
- `app.get('/', ...)` = When someone visits the main door (/)
- `(req, res)` = Request (what customer wants) and Response (what we give back)
- `res.json(...)` = Send back a JSON response

**Test this:** Open browser and go to `http://localhost:5000` - you'll see this message!

### Step 5: Connect Other Rooms (Routes) 🏠

```javascript
app.use('/api/auth', require('./routes/auth'));
```

**What this means:**
- `/api/auth` = The path prefix (like "Building A, Floor 2")
- `require('./routes/auth')` = Import the auth route file
- All auth routes will start with `/api/auth/...`

**Examples:**
- `/api/auth/register` = Registration endpoint
- `/api/auth/login` = Login endpoint

### Step 6: Start the Restaurant (Server) 🚀

```javascript
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }
        
        // Initialize database tables
        await initializeDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 CRM Backend API v1.0.0`);
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

startServer();
```

**What happens here:**
1. **Test database** = Check if storage room is accessible
2. **Initialize tables** = Set up storage shelves
3. **Start listening** = Open restaurant doors for customers
4. **Error handling** = If something goes wrong, close properly

## 🔍 Understanding async/await

```javascript
async function startServer() {
    const result = await testConnection();
}
```

**async/await** = Modern way to handle things that take time

**Real analogy:**
- **Without async:** "Make coffee NOW! Make toast NOW!" (chaos)
- **With async:** "Make coffee, WAIT for it to finish, THEN make toast" (organized)

## 🌐 HTTP Methods Explained

Our server can handle different types of requests:

| Method | Purpose | Real Example | Code Example |
|--------|---------|--------------|--------------|
| **GET** | Get information | "Show me the menu" | `app.get('/menu', ...)` |
| **POST** | Create new data | "Place an order" | `app.post('/orders', ...)` |
| **PUT** | Update existing | "Change my order" | `app.put('/orders/123', ...)` |
| **DELETE** | Remove data | "Cancel my order" | `app.delete('/orders/123', ...)` |

## 📡 Request and Response Objects

### Request (req) - What customer wants
```javascript
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;  // Data from frontend
    const userAgent = req.headers['user-agent'];  // Browser info
    const ip = req.ip;  // Customer's location
});
```

### Response (res) - What we give back
```javascript
app.post('/api/auth/register', (req, res) => {
    // Success response
    res.status(201).json({
        success: true,
        message: 'Account created!'
    });
    
    // Error response
    res.status(400).json({
        success: false,
        message: 'Email already exists'
    });
});
```

## 🎯 Status Codes - Restaurant Language

| Code | Meaning | Restaurant Analogy |
|------|---------|-------------------|
| **200** | OK | "Here's your order!" |
| **201** | Created | "Order placed successfully!" |
| **400** | Bad Request | "I don't understand your order" |
| **401** | Unauthorized | "Please login first" |
| **404** | Not Found | "That item isn't on our menu" |
| **409** | Conflict | "That table is already taken" |
| **500** | Server Error | "Our kitchen is broken, sorry!" |

## 🔧 Environment Variables in Server

```javascript
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || 'localhost';
```

**Why use environment variables?**
- **Security** = Don't put passwords in code
- **Flexibility** = Different settings for development/production
- **Teamwork** = Each developer can have their own settings

## 🚀 Starting Your Server

### Development Mode (Auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Manual Mode:
```bash
node server.js
```

## 🔍 Testing Your Server

### Method 1: Browser
Open `http://localhost:5000` - should see welcome message

### Method 2: Command Line
```bash
curl http://localhost:5000
```

### Method 3: Postman
Create GET request to `http://localhost:5000`

## ⚠️ Common Server Issues

### 1. Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** 
- Kill process using port 5000: `npx kill-port 5000`
- Or use different port in .env file

### 2. Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:** Run `npm install`

### 3. Database Connection Failed
```
❌ Cannot start server: Database connection failed
```
**Solution:** Check MySQL is running and .env credentials are correct

## 🎯 Server Lifecycle

```
1. Start server.js
2. Load environment variables
3. Import dependencies
4. Set up middleware
5. Define routes
6. Test database connection
7. Initialize database tables
8. Start listening on PORT
9. Ready to handle requests!
```

## 🏗️ Server Architecture

```
                Server.js (Main Controller)
                       |
         ┌─────────────┼─────────────┐
         │             │             │
    Middleware     Routes        Database
    (Guards)     (Handlers)    (Storage)
         │             │             │
    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
   CORS      Auth       Database
   Body      Routes     Connection
   Parser
```

## 🎯 Quick Quiz

1. What does `app.use()` do?
2. What's the difference between `req` and `res`?
3. Why do we use `async/await`?
4. What happens if database connection fails?

## 🚀 Next Steps

Now that your server is running, let's learn how to keep secrets safe!

*Next: [Environment Variables & Security](./03-environment-variables.md)*

---

**Key Takeaway:** Your server is like a restaurant - it welcomes customers (frontend), processes their orders (requests), and serves them food (responses)! 🍽️
