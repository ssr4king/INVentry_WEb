const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new admin (First time setup or restricted)
// @route   POST /api/auth/register-admin
// @access  Public
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Force role to admin
    const user = await User.create({
        name,
        email,
        password,
        role: 'admin',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Create a new employee
// @route   POST /api/auth/create-employee
// @access  Private/Admin
const createEmployee = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Force role to employee
    const user = await User.create({
        name,
        email,
        password,
        role: 'employee',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: 'Employee created successfully' // No token needed for creation
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Get all employees
// @route   GET /api/auth/employees
// @access  Private/Admin
const getEmployees = asyncHandler(async (req, res) => {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
});

// @desc    Update employee (e.g. deactivate or change name)
// @route   PUT /api/auth/employees/:id
// @access  Private/Admin
const updateEmployee = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        // Prevent changing own role or main admin accidentally if logic wasn't strict
        // Here we assume only editing employees

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete employee
// @route   DELETE /api/auth/employees/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent deleting admin (self) via this route is handled by role check middleware usually,
        // but adding check here is safer.
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin users');
        }

        await user.remove(); // or User.deleteOne({ _id: req.params.id }) in newer Mongoose
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Helper for remove() deprecation in Mongoose 6+
const deleteUserWrapper = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin users');
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User removed' });
});


module.exports = {
    registerAdmin,
    loginUser,
    createEmployee,
    getEmployees,
    updateEmployee,
    deleteEmployee: deleteUserWrapper
};
