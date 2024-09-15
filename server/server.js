const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const dbo = require("./db/conn");
const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// API Routes
app.use(require("./routes/record"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// Root route for checking server status
app.get("/", (req, res) => {
    res.send("App is running");
});

// Catch-all route that sends back the React app's index.html for any unhandled routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Connect to MongoDB and start the server
dbo.connectToMongoDB((error) => {
    if (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1); // Exit with failure
    }

    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
});
