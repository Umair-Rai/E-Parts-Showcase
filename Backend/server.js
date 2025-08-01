// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Import Models
const Admin = require("./models/Admin");
const Customer = require("./models/Customer");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});

// Default Route
app.get("/", (req, res) => {
  res.send("🌐 Paid Project API is running...");
});

// Routes to fetch data from MongoDB
app.get("/admins", async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
});

app.get("/customers", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

app.get("/categories", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});

app.get("/orders", async (req, res) => {
  const orders = await Order.find()
    .populate("customer")
    .populate("products.product");
  res.json(orders);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
