const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, {});

// Create a Mongoose schema and model
const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
});

const Item = mongoose.model("Item", itemSchema, "items");

// Define API routes

// Create an item
app.post("/items", async (req, res) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: "Could not create the item." });
    }
});

// Read all items
app.get("/items", async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch items." });
    }
});

// Read one item by ID
app.get("/items/:itemId", async (req, res) => {
    try {
        const item = await Item.findById(req.params.itemId);
        if (!item) {
            res.status(404).json({ error: "Item not found." });
        } else {
            res.json(item);
        }
    } catch (error) {
        res.status(500).json({ error: "Could not fetch the item." });
    }
});

// Update an item by ID
app.put("/items/:itemId", async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
        if (!updatedItem) {
            res.status(404).json({ error: "Item not found." });
        } else {
            res.json(updatedItem);
        }
    } catch (error) {
        res.status(500).json({ error: "Could not update the item." });
    }
});

// Delete an item by ID
app.delete("/items/:itemId", async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndRemove(req.params.itemId);
        if (!deletedItem) {
            res.status(404).json({ error: "Item not found." });
        } else {
            res.json(deletedItem);
        }
    } catch (error) {
        res.status(500).json({ error: "Could not delete the item." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
