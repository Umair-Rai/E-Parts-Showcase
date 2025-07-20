// src/pages/ViewAllProduct.jsx
import React from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Deluxe Cat Tree',
    subtitle: 'Brown, 3 Levels',
    price: 'SAR 120',
    inStock: true,
    category: 'Cat',
    ProductCategory: 'Food',
    imageUrl: 'https://via.placeholder.com/60',
  },
  // Add more products here as needed...
];

export default function ViewAllProducts() {
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate('/admin/add-product');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">View All Products</h1>
        <p className="text-gray-600">Manage store inventory and product listings</p>
      </div>

      {/* Filter and Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-1 gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select className="w-48 px-4 py-2 border rounded-xl text-gray-700">
            <option>All Categories</option>
            <option>Cat</option>
            <option>Dog</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-auto bg-white shadow rounded-xl">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4"><input type="checkbox" /></th>
              <th className="p-4">Image</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock Status</th>
              <th className="p-4">Category</th>
              <th className="p-4">ProductCategory</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="p-4"><input type="checkbox" /></td>
                <td className="p-4"><img src={product.imageUrl} alt="Product" className="w-12 h-12 rounded object-cover" /></td>
                <td className="p-4">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.subtitle}</div>
                </td>
                <td className="p-4">{product.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{product.ProductCategory}</td>
                <td className="p-4">
                  <div className="flex gap-2 items-center">
                    <Link to={`/admin/update-product/${product.id}`}>
                      <Pencil className="text-blue-600 hover:scale-110 transition cursor-pointer" size={18} />
                    </Link>
                    <Trash2 className="text-red-600 hover:scale-110 transition cursor-pointer" size={18} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>Showing 1 to 10 of 97 results</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border hover:bg-gray-100">Previous</button>
          {[1, 2, 3].map((n) => (
            <button key={n} className="px-3 py-1 rounded border hover:bg-gray-100">{n}</button>
          ))}
          <button className="px-3 py-1 rounded border hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  );
}
