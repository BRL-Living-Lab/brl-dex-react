const express = require("express");
const router = express.Router();
const dataRequestController = require("../controllers/dataRequest.controller");

// Define DataRequest routes
router.post("/dataRequests", dataRequestController.createDataRequest);
router.get("/dataRequests", dataRequestController.getAllDataRequests);
router.get("/dataRequests/:id", dataRequestController.getDataRequestById);
router.put("/dataRequests/:id", dataRequestController.updateDataRequest);
router.delete("/dataRequests/:id", dataRequestController.deleteDataRequest);

module.exports = router;
