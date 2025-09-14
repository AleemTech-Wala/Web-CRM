const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const router = express.Router();

// User Registration Endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // 1. Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        // Password strength validation
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
        
        // 2. Check if email already exists
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
        
        // 3. Hash password (encryption with salt)
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // 4. Create user in database
        const [result] = await connection.execute(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name || null]
        );
        
        connection.release();
        
        // 5. Success response (don't send password back)
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
        
        console.log(`✅ New user registered: ${email}`);
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Test endpoint to check if email exists (for frontend validation)
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

module.exports = router;
