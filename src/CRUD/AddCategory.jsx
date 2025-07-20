import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const AddCategory = () => {
  const [categoryType, setCategoryType] = useState("");
  const [petCategoryName, setPetCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [petCategories, setPetCategories] = useState([]);

  useEffect(() => {
    // Simulate fetching existing categories
    setTimeout(() => {
      setPetCategories(["Dogs", "Cats", "Birds"]);
    }, 500);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-6 flex justify-center items-start">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Category</h1>
        <p className="text-gray-500 mb-6">
          Choose category type and provide details.
        </p>

        {/* Step 1: Category Type Selection */}
        <div className="flex space-x-6 mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="categoryType"
              value="pet"
              checked={categoryType === "pet"}
              onChange={() => setCategoryType("pet")}
            />
            <span className="text-gray-700 font-medium">Pet Category</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="categoryType"
              value="subcategory"
              checked={categoryType === "subcategory"}
              onChange={() => setCategoryType("subcategory")}
            />
            <span className="text-gray-700 font-medium">Product Subcategory</span>
          </label>
        </div>

        {/* Dynamic Form Section */}
        <AnimatePresence>
          {categoryType === "pet" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              {/* Category Name */}
              <input
                type="text"
                placeholder="Category Name"
                value={petCategoryName}
                onChange={(e) => setPetCategoryName(e.target.value)}
                className="w-full border rounded-lg p-3"
              />

              {/* Upload Image */}
              <label
                htmlFor="fileUpload"
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-purple-500 hover:shadow-purple-lg transition"
              >
                <CloudArrowUpIcon className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500">Drag & Drop or Click to Upload</p>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mt-4"
                />
              )}
            </motion.div>
          )}

          {categoryType === "subcategory" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              {/* Subcategory Name */}
              <input
                type="text"
                placeholder="Subcategory Name"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                className="w-full border rounded-lg p-3"
              />

              {/* Parent Category */}
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full border rounded-lg p-3"
              >
                <option value="">Select Parent Category</option>
                {petCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-400 transition">
            Save Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;