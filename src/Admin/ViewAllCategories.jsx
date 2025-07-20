import React from 'react';
import { Link } from 'react-router-dom'; // ✅ Added
import { PencilIcon, TrashIcon, FolderIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { Cat, Dog, Plus } from 'lucide-react'; // ✅ Plus icon added
import { motion } from 'framer-motion';

const parentCategories = [
  {
    id: 1,
    name: 'Cats',
    image: 'https://placekitten.com/60/60',
    icon: <Cat className="h-5 w-5 text-gray-500" />,
  },
  {
    id: 2,
    name: 'Dogs',
    image: 'https://placedog.net/60/60',
    icon: <Dog className="h-5 w-5 text-gray-500" />,
  },
];

const subCategories = [
  {
    id: 1,
    name: 'Toys',
    parent: 'Cats',
    icon: <FolderIcon className="h-5 w-5 text-gray-500" />,
  },
  {
    id: 2,
    name: 'Food',
    parent: 'Cats',
    icon: <ArchiveBoxIcon className="h-5 w-5 text-gray-500" />,
  },
  {
    id: 3,
    name: 'Accessories',
    parent: 'Dogs',
    icon: <FolderIcon className="h-5 w-5 text-gray-500" />,
  },
  {
    id: 4,
    name: 'Treats',
    parent: 'Dogs',
    icon: <ArchiveBoxIcon className="h-5 w-5 text-gray-500" />,
  },
];

const ViewAllCategories = () => {
  return (
    <div className="p-6 font-inter bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Categories</h1>
        <p className="text-gray-600">Manage pet categories and their subcategories</p>
      </div>

      {/* Add Category Button */}
      <div className="flex justify-end mb-4"> {/* ✅ Button container */}
        <Link
          to="/admin/add-category"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </Link>
      </div>

      {/* Parent Category Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Pet Categories</h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Icon</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {parentCategories.map((cat) => (
                <motion.tr
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">{cat.icon}</td>
                  <td className="px-6 py-4 font-medium">{cat.name}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <PencilIcon className="h-5 w-5 text-blue-500 hover:scale-110 transition cursor-pointer" />
                    <TrashIcon className="h-5 w-5 text-red-500 hover:scale-110 transition cursor-pointer" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub Category Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Product Subcategories</h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
              <tr>
                <th className="px-6 py-4">Icon</th>
                <th className="px-6 py-4">Subcategory Name</th>
                <th className="px-6 py-4">Parent Category</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {subCategories.map((sub) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">{sub.icon}</td>
                  <td className="px-6 py-4 font-medium">{sub.name}</td>
                  <td className="px-6 py-4">{sub.parent}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <PencilIcon className="h-5 w-5 text-blue-500 hover:scale-110 transition cursor-pointer" />
                    <TrashIcon className="h-5 w-5 text-red-500 hover:scale-110 transition cursor-pointer" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewAllCategories;
