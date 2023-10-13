const Asset = require("../models/Asset.model");

// Create a new Asset
exports.createAsset = async (req, res) => {
    try {
        const newAsset = new Asset(req.body);
        const savedAsset = await newAsset.save();
        res.status(201).json(savedAsset);
    } catch (error) {
        res.status(500).json({ error: "Could not create the asset." });
    }
};

// Get all Assets
exports.getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find();
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch assets." });
    }
};

// Get Asset by ID
exports.getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ error: "Asset not found." });
        }
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch the asset." });
    }
};

// Update Asset by ID
exports.updateAsset = async (req, res) => {
    try {
        const updatedAsset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAsset) {
            return res.status(404).json({ error: "Asset not found." });
        }
        res.json(updatedAsset);
    } catch (error) {
        res.status(500).json({ error: "Could not update the asset." });
    }
};

// Delete Asset by ID
exports.deleteAsset = async (req, res) => {
    try {
        const deletedAsset = await Asset.findByIdAndRemove(req.params.id);
        if (!deletedAsset) {
            return res.status(404).json({ error: "Asset not found." });
        }
        res.json(deletedAsset);
    } catch (error) {
        res.status(500).json({ error: "Could not delete the asset." });
    }
};

// Get Assets by User Address
exports.getAssetsByUserAddress = async (req, res) => {
    try {
        const userAddress = req.query.userAddress; // Extract userAddress from query parameters

        if (!userAddress) {
            return res.status(400).json({ error: "User Address is required in the query parameters." });
        }

        // Query assets by userAddress
        const assets = await Asset.find({ userAddress });

        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch assets." });
    }
};
