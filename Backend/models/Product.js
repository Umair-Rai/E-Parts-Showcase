const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  sizeDescriptionMap: {
    type: Map,
    of: String,
    default: {},
  },
  pics: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);