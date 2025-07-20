import React, { useState } from 'react';
import { Plus, Trash2, Upload, ChevronDown, ChevronRight } from 'lucide-react';

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([{ weight: '', price: '', stock: '' }]);
  const [form, setForm] = useState({
    petCategory: '',
    productCategory: '',
    productName: '',
    description: ''
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files].slice(0, 6);
    setImages(newImages);
  };

  const handleImageRemove = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { weight: '', price: '', stock: '' }]);
  };

  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-8 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
          <p className="text-sm text-gray-500">Add product details, upload images, and set variants.</p>
        </div>

        {/* Category Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 flex items-center">
            <ChevronRight className="mr-1" /> Category Selection
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.petCategory}
                onChange={(e) => handleFormChange('petCategory', e.target.value)}
              >
                <option value="">Select pet category</option>
                <option value="Cat">Cat</option>
                <option value="Dog">Dog</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.productCategory}
                onChange={(e) => handleFormChange('productCategory', e.target.value)}
              >
                <option value="">Select product category</option>
                <option value="Food">Food</option>
                <option value="Toys">Toys</option>
                <option value="Items">Items</option>
              </select>
            </div>
          </div>
        </section>

        {/* Product Information */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 flex items-center">
            <ChevronRight className="mr-1" /> Product Information
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={form.productName}
              onChange={(e) => handleFormChange('productName', e.target.value)}
            />

            <textarea
              placeholder="Description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
            />

            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 relative transition hover:bg-gray-50">
              <Upload size={32} />
              <p className="mt-2">Drag and drop images here or click to upload</p>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
            </div>

            {/* Uploaded Images */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm animate-fade-in"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt="Preview"
                    className="h-20 w-full object-cover"
                  />
                  <button
                    onClick={() => handleImageRemove(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Variants */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600 flex items-center">
            <ChevronRight className="mr-1" /> Product Variants
          </h3>
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center group relative animate-slide-down">
              <input
                type="text"
                placeholder="Weight (e.g. 500g)"
                value={variant.weight}
                onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              <input
                type="number"
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full"
              />
              {index > 0 && (
                <button
                  onClick={() => removeVariant(index)}
                  className="absolute top-0 right-0 bg-white text-red-500 p-1 rounded-full shadow group-hover:scale-110 transition"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="flex items-center text-blue-600 hover:underline mt-2"
          >
            <Plus className="mr-1" size={16} /> Add Variant
          </button>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end space-x-3">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition">
            Cancel
          </button>
          <button className="border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-lg transition">
            Save as Draft
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition">
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
