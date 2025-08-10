import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Adjust these imports if your component paths differ
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';

const UpdateProduct = () => {
  const { productId } = useParams(); // from route: /admin/products/:productId ?
  const [product, setProduct] = useState(null);

  const [petCategory, setPetCategory] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // array of preview URLs
  const [variants, setVariants] = useState([]);

  /* ------------------------------------------------------------------ */
  /* Load product (mock)                                                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    // TODO: replace with real API call using productId
    const fetchProduct = async () => {
      const mockProduct = {
        petCategory: 'Cat',
        productCategory: 'Food',
        productName: 'Whiskas Adult',
        description: 'Healthy cat food for adults.',
        images: [],
        variants: [
          { weight: '2kg', price: 1200, stock: 10 },
          { weight: '5kg', price: 2500, stock: 5 },
        ],
      };
      setProduct(mockProduct);
      setPetCategory(mockProduct.petCategory);
      setProductCategory(mockProduct.productCategory);
      setProductName(mockProduct.productName);
      setDescription(mockProduct.description);
      setVariants(mockProduct.variants);
      setImages(mockProduct.images);
    };

    fetchProduct();
  }, [productId]);

  /* ------------------------------------------------------------------ */
  /* Image Upload                                                       */
  /* ------------------------------------------------------------------ */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Allow up to 6 images total
    const remainingSlots = Math.max(0, 6 - images.length);
    const validFiles = files.slice(0, remainingSlots);

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...previews]);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ------------------------------------------------------------------ */
  /* Variants                                                           */
  /* ------------------------------------------------------------------ */
  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { weight: '', price: '', stock: '' }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  /* ------------------------------------------------------------------ */
  /* Submit                                                             */
  /* ------------------------------------------------------------------ */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      petCategory,
      productCategory,
      productName,
      description,
      images,
      variants,
    });
    alert('Product updated successfully!');
  };

  if (!product) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-poppins">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-6 md:p-10 max-w-5xl mx-auto animate-fadeInUp"
      >
        <h2 className="text-3xl font-semibold mb-1 text-blue-600">Update Product</h2>
        <p className="text-gray-500 mb-8">Edit product details, images and variants</p>

        {/* Category Section */}
        <div className="mb-6 border-b pb-4">
  <h3 className="text-lg font-semibold text-gray-700 mb-4">🗂 Category</h3>
  <div className="grid md:grid-cols-2 gap-4">
    {/* Pet Category */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pet Category
      </label>
      <select
        value={petCategory}
        onChange={(e) => setPetCategory(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Pet Category</option>
        <option value="Cat">Cat</option>
        <option value="Dog">Dog</option>
      </select>
    </div>

    {/* Product Category */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Category
      </label>
      <select
        value={productCategory}
        onChange={(e) => setProductCategory(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Product Category</option>
        <option value="Food">Food</option>
        <option value="Toys">Toys</option>
        <option value="Items">Items</option>
      </select>
    </div>
  </div>
</div>


        {/* Product Information */}
        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📝 Product Info</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          {/* Upload Images */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Upload Images
            </label>

            {/* IMPORTANT: relative here so absolute input stays in this box */}
            <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center text-gray-400 hover:border-blue-400 transition cursor-pointer">
              <AiOutlinePlus size={28} />
              <p className="mt-2">Drag &amp; drop images here or click to upload</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="" /* hide default tooltip */
              />
            </div>

            {/* Preview thumbnails */}
            <div className="flex flex-wrap gap-4 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`upload-${idx}`}
                    className="w-24 h-24 object-cover rounded shadow-md animate-fadeInUp"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md"
                  >
                    <AiOutlineDelete size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📦 Product Variants</h3>
          {variants.map((variant, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 items-end">
              <Input
                label="Weight"
                value={variant.weight}
                onChange={(e) => handleVariantChange(idx, 'weight', e.target.value)}
                placeholder="e.g., 5kg"
              />
              <Input
                label="Price"
                type="number"
                value={variant.price}
                onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
              />
              <Input
                label="Stock"
                type="number"
                value={variant.stock}
                onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemoveVariant(idx)}
                className="sm:mt-auto bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded shadow-md flex items-center justify-center"
              >
                <AiOutlineDelete />
              </button>
            </div>
          ))}
          <Button type="button" className="mt-2" onClick={handleAddVariant}>
            + Add Variant
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-4 mt-8">
          <Button type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit">Update Product</Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
