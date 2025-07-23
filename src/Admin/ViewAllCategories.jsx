import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const allCategories = [
  {
    id: 1,
    name: 'Toys',
    image: 'https://placekitten.com/60/60',
    isSpecial: true,
  },
  {
    id: 2,
    name: 'Food',
    image: 'https://placedog.net/60/60',
    isSpecial: false,
  },
];

const ViewAllCategories = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Categories</h1>
          <p className="text-sm text-gray-500">Manage all categories in a single place.</p>
        </div>
        <Link
          to="/admin/add-category"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> + Add Category
        </Link>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Picture</th>
              <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Special Category</th>
              <th className="w-1/4 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allCategories.map((category, index) => (
              <motion.tr
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="w-1/4 px-6 py-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-10 h-10 rounded-full object-cover mx-auto"
                  />
                </td>
                <td className="w-1/4 px-6 py-4 text-gray-800 font-medium">{category.name}</td>
                <td className="w-1/4 px-6 py-4 text-gray-600">{category.isSpecial ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3 pr-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }} 
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAllCategories;
