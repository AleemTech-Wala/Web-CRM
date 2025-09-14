# Database Connection - Talking to Your Storage Room 🗄️

Think of database connection as **getting keys to your storage room** where all your important data (users, orders, etc.) is kept safe!

## 🤔 What is a Database Connection?

Imagine a **warehouse**:
- **Warehouse** = MySQL Database (where data is stored)
- **Warehouse keys** = Database connection (how to access it)
- **Warehouse manager** = mysql2 library (helps you talk to warehouse)
- **Storage boxes** = Tables (users, products, orders)

## 🏗️ Our Database Architecture

```
Backend (Node.js) ←→ mysql2 library ←→ MySQL Database
     🧠                    🔑                🗄️
   Your code            Translator         Data storage
```

## 📄 Our Database Connection File

Let's break down `config/database.js` step by step:

### Step 1: Import Tools 🛠️

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();
```

**mysql2/promise** = Modern version that uses async/await
- **mysql2** = The translator between Node.js and MySQL
- **/promise** = Uses modern JavaScript (cleaner code)

**Alternative (older style):**
```javascript
const mysql = require('mysql2'); // Without promises (more complex)
```

### Step 2: Configuration Object 📋

```javascript
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'crm_database'
};
```

**Breaking it down:**
- **host** = Where database lives (your computer = localhost)
- **user** = Username to login (root = admin user)
- **password** = Secret password (from .env file)
- **database** = Which database to use (like which folder to open)

### Step 3: Connection Pool 🏊‍♂️

```javascript
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
```

**What is a Connection Pool?**
Think of it like a **taxi service**:
- **Regular connection** = Call a taxi each time (slow)
- **Connection pool** = Pre-book 10 taxis that wait for you (fast!)

**Pool settings explained:**
- **connectionLimit: 10** = Keep 10 connections ready
- **waitForConnections: true** = Wait if all 10 are busy
- **queueLimit: 0** = No limit on waiting requests

### Step 4: Test Connection Function 🧪

```javascript
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release(); // Give connection back to pool
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}
```

**What happens here:**
1. **Get connection** = Borrow a taxi from the pool
2. **Log success** = Celebrate that warehouse is accessible
3. **Release connection** = Return taxi to pool for others to use
4. **Handle errors** = If warehouse is locked, tell us why

## 🏗️ Database Initialization

```javascript
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Create users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                role ENUM('employee', 'manager', 'admin') DEFAULT 'employee',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_role (role)
            );
        `;
        
        await connection.execute(createUsersTable);
        console.log('✅ Users table created/verified successfully!');
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
}
```

## 📊 Understanding Our Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('employee', 'manager', 'admin') DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

### Column Breakdown:

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| **id** | INT AUTO_INCREMENT | Unique user number | 1, 2, 3... |
| **email** | VARCHAR(255) UNIQUE | User's email | john@company.com |
| **password** | VARCHAR(255) | Encrypted password | $2b$10$abc123... |
| **name** | VARCHAR(255) | User's full name | John Doe |
| **role** | ENUM | User permission level | employee, manager, admin |
| **is_active** | BOOLEAN | Account status | true/false |
| **created_at** | TIMESTAMP | When account was made | 2025-01-15 10:30:00 |
| **updated_at** | TIMESTAMP | Last modification | 2025-01-20 14:45:00 |

### Special Features:

**AUTO_INCREMENT** = Automatically assigns next number (1, 2, 3...)
**PRIMARY KEY** = Unique identifier (like social security number)
**UNIQUE** = No two users can have same email
**NOT NULL** = This field is required
**DEFAULT** = If no value provided, use this
**INDEX** = Makes searching faster (like book index)

## 🔄 Using the Database Connection

### Basic Query Example:
```javascript
// Get all users
async function getAllUsers() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users');
        connection.release();
        return rows;
    } catch (error) {
        console.error('❌ Error getting users:', error);
        throw error;
    }
}
```

### Insert New User:
```javascript
async function createUser(email, hashedPassword, name) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name]
        );
        connection.release();
        return result.insertId; // Returns the new user's ID
    } catch (error) {
        console.error('❌ Error creating user:', error);
        throw error;
    }
}
```

### Check if Email Exists:
```javascript
async function emailExists(email) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        connection.release();
        return rows.length > 0; // true if email found
    } catch (error) {
        console.error('❌ Error checking email:', error);
        throw error;
    }
}
```

## 🔒 SQL Injection Prevention

### ❌ Dangerous (DON'T DO THIS):
```javascript
const email = "user@example.com'; DROP TABLE users; --";
const query = `SELECT * FROM users WHERE email = '${email}'`; // DANGEROUS!
```

### ✅ Safe (DO THIS):
```javascript
const email = "user@example.com'; DROP TABLE users; --";
const [rows] = await connection.execute(
    'SELECT * FROM users WHERE email = ?', // Safe placeholder
    [email] // mysql2 automatically escapes this
);
```

**Why placeholders (?) are safe:**
- mysql2 automatically escapes dangerous characters
- Treats input as data, not executable code
- Prevents hackers from injecting malicious SQL

## 🎯 Connection Management Best Practices

### 1. Always Release Connections ✅
```javascript
async function goodExample() {
    const connection = await pool.getConnection();
    try {
        // Your database work here
        const [rows] = await connection.execute('SELECT * FROM users');
        return rows;
    } finally {
        connection.release(); // Always return to pool
    }
}
```

### 2. Handle Errors Properly ✅
```javascript
async function handleErrors() {
    try {
        const connection = await pool.getConnection();
        // Database operations
        connection.release();
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Email already exists');
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            throw new Error('Database table not found');
        } else {
            throw new Error('Database error occurred');
        }
    }
}
```

### 3. Use Transactions for Multiple Operations ✅
```javascript
async function transferMoney(fromUserId, toUserId, amount) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); // Start transaction
        
        // Deduct from sender
        await connection.execute(
            'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
            [amount, fromUserId]
        );
        
        // Add to receiver
        await connection.execute(
            'UPDATE accounts SET balance = balance + ? WHERE user_id = ?',
            [amount, toUserId]
        );
        
        await connection.commit(); // Confirm all changes
        console.log('✅ Transfer completed');
    } catch (error) {
        await connection.rollback(); // Undo all changes
        console.error('❌ Transfer failed, rolling back');
        throw error;
    } finally {
        connection.release();
    }
}
```

## 🔧 Database Setup Steps

### 1. Install MySQL
- **Windows:** Download from mysql.com
- **Mac:** `brew install mysql`
- **Linux:** `sudo apt install mysql-server`

### 2. Create Database
```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE crm_database;

-- Create user (optional)
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON crm_database.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Update .env File
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_database
DB_PORT=3306
```

## 🧪 Testing Database Connection

Create test file `test-db.js`:
```javascript
const { testConnection, initializeDatabase } = require('./config/database');

async function testDatabase() {
    console.log('🧪 Testing database connection...');
    
    const connected = await testConnection();
    if (connected) {
        console.log('🎉 Connection test passed!');
        
        console.log('🏗️ Initializing database...');
        const initialized = await initializeDatabase();
        
        if (initialized) {
            console.log('🎉 Database setup complete!');
        }
    }
}

testDatabase();
```

Run with: `node test-db.js`

## ⚠️ Common Database Issues

### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Start MySQL service
- **Windows:** Services → MySQL → Start
- **Mac:** `brew services start mysql`
- **Linux:** `sudo systemctl start mysql`

### 2. Access Denied
```
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```
**Solution:** Check username/password in .env file

### 3. Database Doesn't Exist
```
Error: ER_BAD_DB_ERROR: Unknown database 'crm_database'
```
**Solution:** Create database first:
```sql
CREATE DATABASE crm_database;
```

### 4. Too Many Connections
```
Error: ER_TOO_MANY_USER_CONNECTIONS
```
**Solution:** Reduce connectionLimit in pool or release connections properly

## 🎯 Database Connection Checklist

- [ ] MySQL installed and running
- [ ] Database created
- [ ] .env file configured
- [ ] mysql2 package installed
- [ ] Connection pool created
- [ ] Test connection function works
- [ ] Tables initialized
- [ ] Using parameterized queries (?)
- [ ] Always releasing connections

## 🎯 Quick Quiz

1. What is a connection pool and why use it?
2. What does `connection.release()` do?
3. Why use `?` placeholders in queries?
4. What happens if you forget to release a connection?

## 🚀 Next Steps

Now that your backend can talk to the database, let's create API routes!

*Next: [API Routes & Endpoints](./05-api-routes.md)*

---

**Key Takeaway:** Database connection is like getting keys to your warehouse - once you have them, you can store and retrieve your valuable data safely! 🔑🗄️
