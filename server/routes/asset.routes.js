const express = require("express");
const router = express.Router();
const assetController = require("../controllers/asset.controller");

// Create a new asset
router.post("/assets", assetController.createAsset);

// Get all assets
router.get("/assets", assetController.getAllAssets);

// Get an asset by ID
router.get("/assets/:id", assetController.getAssetById);

// Update an asset by ID
router.put("/assets/:id", assetController.updateAsset);

// Delete an asset by ID
router.delete("/assets/:id", assetController.deleteAsset);

// Get assets by user address
router.get("/assets/user", assetController.getAssetsByUserAddress);

module.exports = router;
