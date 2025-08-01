const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  pic: {
    type: String,
    default: "",
  },
  specialCategory: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);
