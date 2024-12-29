const express = require("express");
const app = express();
const userAuthRoutes = require("./routes/userAuthRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const userJobRoutes = require("./routes/userJobRoutes")

app.use(express.json())
app.use("/api/user", userAuthRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/user", userJobRoutes);
    
module.exports = app;