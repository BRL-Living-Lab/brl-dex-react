const express = require("express");
const router = express.Router();
const fmlController = require("../controllers/fmlRequest.controller");

// Define fmlRequests routes
router.post("/fmlRequests", fmlController.createFmlRequest);
router.get("/fmlRequests", fmlController.getAllFmlRequests);
router.get("/fmlRequests/:id", fmlController.getFmlRequestById);
router.put("/fmlRequests/:id", fmlController.updateFmlRequest);
router.delete("/fmlRequests/:id", fmlController.deleteFmlRequest);

module.exports = router;
