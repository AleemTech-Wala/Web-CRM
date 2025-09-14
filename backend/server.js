const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection, initializeDatabase } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(bodyParser.json()); // Parse JSON requests
app.use(express.json()); // Built-in JSON parser

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'CRM Backend API is running!',
        version: '1.0.0',
        status: 'active'
    });
});

// Import routes
app.use('/api/auth', require('./routes/auth'));

// Initialize database and start server
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
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
