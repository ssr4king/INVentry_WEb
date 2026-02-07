const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Enhanced CORS Options
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Define allowed origins
        const allowedOrigins = [
            'https://in-ventory-web.vercel.app',
            'https://in-ventry-w-eb.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ];

        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Logging Middleware (Debug)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    next();
});

// Default route
app.get('/', (req, res) => {
    res.send('Inventory Management System API is running...');
});

// Routes will be mounted here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
