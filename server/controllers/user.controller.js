const User = require("../models/User.model");

// Create a new User
exports.createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ error: "Could not create the user." });
    }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch users." });
    }
};

// Get User by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch the user." });
    }
};

// Update User by ID
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Could not update the user." });
    }
};

// Delete User by ID
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndRemove(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(deletedUser);
    } catch (error) {
        res.status(500).json({ error: "Could not delete the user." });
    }
};
