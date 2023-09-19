const DataRequest = require("../models/DataRequest.model");

// Controller functions
// Create a new DataRequest
exports.createDataRequest = async (req, res) => {
    try {
        const requestData = req.body; // Data from the request body

        console.log({ requestData });

        // Create a new DataRequest document with the provided data
        const newDataRequest = new DataRequest({
            status: "open",
            title: requestData.title,
            description: requestData.description,
            schema: requestData.schema,
            instructions: requestData.instructions,
            assetAddress: requestData.assetAddress,
        });

        // Save the new DataRequest document
        const savedDataRequest = await newDataRequest.save();

        res.status(201).json(savedDataRequest);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not create the data request." });
    }
};

// Get all DataRequests
exports.getAllDataRequests = async (req, res) => {
    try {
        const dataRequests = await DataRequest.find();
        res.json(dataRequests);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch data requests." });
    }
};

// Get DataRequest by ID
exports.getDataRequestById = async (req, res) => {
    try {
        const dataRequest = await DataRequest.findById(req.params.id);
        if (!dataRequest) {
            return res.status(404).json({ error: "DataRequest not found." });
        }
        res.json(dataRequest);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch the data request." });
    }
};

// Update DataRequest by ID
exports.updateDataRequest = async (req, res) => {
    try {
        const dataRequestId = req.params.id;
        const updateData = req.body; // Updated data from the request body

        // Use $set to update other fields (title, description, schema, instructions)
        // Use $push to append new addresses to assetAddress
        const updatedDataRequest = await DataRequest.findOneAndUpdate(
            { _id: dataRequestId },
            {
                $set: {
                    title: updateData.title,
                    description: updateData.description,
                    schema: updateData.schema,
                    instructions: updateData.instructions,
                },
                $push: { assetAddress: { $each: updateData.assetAddress } },
            },
            { new: true }
        );

        if (!updatedDataRequest) {
            return res.status(404).json({ error: "DataRequest not found." });
        }

        res.json(updatedDataRequest);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Could not update the data request." });
    }
};

// Delete DataRequest by ID
exports.deleteDataRequest = async (req, res) => {
    try {
        const deletedDataRequest = await DataRequest.findByIdAndRemove(req.params.id);
        if (!deletedDataRequest) {
            return res.status(404).json({ error: "DataRequest not found." });
        }
        res.json(deletedDataRequest);
    } catch (error) {
        res.status(500).json({ error: "Could not delete the data request." });
    }
};
