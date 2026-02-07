const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginUser,
    createEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register-admin', registerAdmin);
router.post('/login', loginUser);
router.post('/create-employee', protect, admin, createEmployee);
router.get('/employees', protect, admin, getEmployees);
router.put('/employees/:id', protect, admin, updateEmployee); // New
router.delete('/employees/:id', protect, admin, deleteEmployee); // New

module.exports = router;
