const FmlRequest = require("../models/FmlRequest.model");

// Create a new fmlRequest
exports.createFmlRequest = async (req, res) => {
    try {
        const newFmlRequest = new FmlRequest(req.body);
        const savedFmlRequest = await newFmlRequest.save();
        res.status(201).json(savedFmlRequest);
    } catch (error) {
        res.status(500).json({ error: "Could not create the fmlRequest." });
    }
};

// Get all fmlRequest
exports.getAllFmlRequests = async (req, res) => {
    try {
        const fmlRequests = await FmlRequest.find();
        res.json(fmlRequests);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch fmlRequests." });
    }
};

// Get fmlRequest by ID
exports.getFmlRequestById = async (req, res) => {
    try {
        const fmlRequest = await FmlRequest.findById(req.params.id);
        if (!fmlRequest) {
            return res.status(404).json({ error: "FmlRequest not found." });
        }
        res.json(fmlRequest);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch the fmlRequest." });
    }
};

// Update fmlRequest by ID
exports.updateFmlRequest = async (req, res) => {
    try {
        const fmlRequest = await FmlRequest.findById(req.params.id);
        if (!fmlRequest) {
            return res.status(404).json({ error: "FmlRequest not found." });
        }

        // Append the new job ID to the jobIds array
        fmlRequest.jobIds.push(req.body.jobId);

        // Save the updated fmlRequest
        const updatedFmlRequest = await fmlRequest.save();

        res.json(updatedFmlRequest);
    } catch (error) {
        res.status(500).json({ error: "Could not update the fmlRequest." });
    }
};

// Delete fmlRequest by ID
exports.deleteFmlRequest = async (req, res) => {
    try {
        const deletedFmlRequest = await FmlRequest.findByIdAndRemove(req.params.id);
        if (!deletedFmlRequest) {
            return res.status(404).json({ error: "FmlRequest not found." });
        }
        res.json(deletedFmlRequest);
    } catch (error) {
        res.status(500).json({ error: "Could not delete the fmlRequest." });
    }
};

// Get fmlRequests by User Address
exports.getFmlRequestsByUserAddress = async (req, res) => {
    try {
        const userAddress = req.query.userAddress; // Extract userAddress from query parameters

        if (!userAddress) {
            return res.status(400).json({ error: "User Address is required in the query parameters." });
        }

        // Query fmlRequests by userAddress
        const fmlRequests = await FmlRequest.find({ userAddress });

        res.json(fmlRequests);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch fmlRequests." });
    }
};
