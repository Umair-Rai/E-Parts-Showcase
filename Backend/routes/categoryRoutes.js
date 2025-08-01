const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// PUT to add new category to existing pet_type
router.put("/:pet_type", async (req, res) => {
  const { pet_type } = req.params;
  const { newCategory } = req.body;

  if (!newCategory || typeof newCategory !== "string") {
    return res.status(400).json({ error: "Invalid newCategory" });
  }

  try {
    const updated = await Category.findOneAndUpdate(
      { pet_type },
      { $addToSet: { product_categories: newCategory } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Pet type not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

// POST to create or update a pet category
router.post("/", async (req, res) => {
  const { pet_type, product_categories } = req.body;

  if (!pet_type || !Array.isArray(product_categories)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const categoryDoc = await Category.findOne({ pet_type });

    if (categoryDoc) {
      const newCategories = product_categories.filter(
        (cat) => !categoryDoc.product_categories.includes(cat)
      );

      if (newCategories.length === 0) {
        return res.status(409).json({
          message: "All categories already exist for this pet type",
        });
      }

      categoryDoc.product_categories.push(...newCategories);
      await categoryDoc.save();

      return res.status(200).json({
        message: "✅ Category(ies) added to existing pet type",
        data: categoryDoc,
      });
    } else {
      const newCategory = new Category({
        pet_type,
        product_categories,
      });

      const saved = await newCategory.save();

      return res.status(201).json({
        message: "✅ New pet type and categories added",
        data: saved,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
