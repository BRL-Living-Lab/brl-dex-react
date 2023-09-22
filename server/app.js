const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Define API routes

// Routes setup
const dataRequestRoutes = require("./routes/dataRequest.routes");
const assetRoutes = require("./routes/asset.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api", dataRequestRoutes);
app.use("/api", assetRoutes);
app.use("/api", userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
