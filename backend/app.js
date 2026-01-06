const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline scripts for development
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());

app.use("/barcodes", express.static(path.join(__dirname, "barcodes")));

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoute");
const exportRoutes = require("./routes/exportRoutes");
const logRoutes = require("./routes/logRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/logs", logRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;
