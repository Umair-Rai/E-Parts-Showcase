import React, { useState } from 'react';
import Button from '../components/Button';
import Select from '../components/Select';
import Badge from '../components/Badge';
import Input from '../components/Input';
import { Plus, Trash2 } from 'lucide-react';

const AddProduct = () => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    images: [],
  });
  const [variants, setVariants] = useState([
    { model: '', size: '', price: '', stock: '' },
  ]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (productInfo.images.length + files.length > 6) return;
    setProductInfo((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setProductInfo((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { model: '', size: '', price: '', stock: '' }]);
  };

  const removeVariant = (index) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const stepStyle = (s) =>
    `flex items-center gap-2 px-4 py-2 rounded-full transition ${
      step === s ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 animate-fade-in">
        <h1 className="text-2xl font-semibold mb-6 text-gray-700">Add New Product</h1>

        {/* Stepper */}
        <div className="flex justify-between mb-8">
          <div className={stepStyle(1)}>1️⃣ Category</div>
          <div className={stepStyle(2)}>2️⃣ Product Info</div>
          <div className={stepStyle(3)}>3️⃣ Variants</div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <Select
              label="Product Category"
              options={['Food', 'Toys', 'Grooming', 'Health']}
              placeholder="Select a category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Input
              label="Product Name (English)"
              placeholder="Enter product name"
              value={productInfo.name}
              onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
            />
            <label className="block text-sm font-medium text-gray-700">Description (English)</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3"
              rows={4}
              value={productInfo.description}
              onChange={(e) => setProductInfo({ ...productInfo, description: e.target.value })}
            />

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Product Images</label>
              <div className="border-dashed border-2 border-gray-300 p-4 rounded-lg text-center text-gray-500">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="upload"
                  onChange={handleImageUpload}
                />
                <label htmlFor="upload" className="cursor-pointer hover:text-blue-600 transition">
                  + Select Images (max 6)
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {productInfo.images.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-24 object-cover rounded-md shadow-md transition-opacity duration-200"
                    />
                    <button
                      className="absolute top-1 right-1 p-1 bg-white rounded-full shadow group-hover:bg-red-500 group-hover:text-white"
                      onClick={() => removeImage(i)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <label className="block text-sm font-medium text-gray-700">Product Variants</label>
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center animate-slide-down">
                <Input
                  placeholder="Model"
                  value={v.model}
                  onChange={(e) => handleVariantChange(i, 'model', e.target.value)}
                />
                <Input
                  placeholder="Size"
                  value={v.size}
                  onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                />
                <button
                  className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition"
                  onClick={() => removeVariant(i)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={addVariant}
              className="flex items-center text-blue-600 hover:underline transition"
            >
              <Plus className="mr-1" size={16} />
              Add Variant
            </button>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="ghost">Cancel</Button>
                <Button variant="outline">Save as Draft</Button>
                <Button>Save Product</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
