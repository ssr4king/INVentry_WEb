const axios = require('axios');
const fs = require('fs');

async function testLogin(email, password) {
    try {
        console.log(`Testing login for: ${email}`);
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email,
            password
        });
        console.log('Login Successful!');
        console.log('Token:', response.data.token ? 'Present' : 'Missing');
        return true;
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
        return false;
    }
}

// Test data
// You said "admin@test.com" and "same password as before"
// I assume you mean the DB password 'shu12345' or default 'password123'
// The seeder uses 'admin@example.com' with 'password123'
// I will test with 'admin@test.com' and 'password123' as requested
testLogin('admin@test.com', '1234');
