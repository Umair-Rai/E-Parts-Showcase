import React, { useState } from 'react';
import { EyeIcon, CheckIcon, XMarkIcon, CalendarDaysIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const sampleData = [
  {
    id: 1,
    petName: 'Max',
    petImage: 'https://placekitten.com/80/80',
    age: '2 years',
    gender: 'Male',
    type: 'Dog',
    breed: 'Labrador',
    seller: {
      name: 'John Doe',
      email: 'john@example.com',
      contact: '+123456789',
    },
    date: 'Jan 15, 2024',
    status: 'Pending',
  },
  {
    id: 2,
    petName: 'Milo',
    petImage: 'https://placekitten.com/81/81',
    age: '1 year',
    gender: 'Female',
    type: 'Cat',
    breed: 'Persian',
    seller: {
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      contact: '+987654321',
    },
    date: 'Feb 10, 2024',
    status: 'Approved',
  },
];

export default function SellerVerification() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const statusBadge = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-500 text-white',
    Disapproved: 'bg-red-500 text-white',
  };

  const filteredData = sampleData.filter((item) => {
    const matchSearch =
      item.petName.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span role="img" aria-label="paw">🐾</span>
        Seller Breeding Requests
      </h1>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by pet name or seller name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg shadow-sm px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border-gray-300 px-4 py-2 shadow-sm focus:outline-none"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Disapproved">Disapproved</option>
        </select>
        <input
          type="date"
          placeholder="mm/dd/yyyy"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg px-4 py-2 shadow-sm border border-gray-300"
        />
        <button className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105">
          <ArrowPathIcon className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-gray-600 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Pet</th>
              <th className="px-6 py-3">Type & Breed</th>
              <th className="px-6 py-3">Seller Info</th>
              <th className="px-6 py-3">Request Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={item.petImage} alt={item.petName} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold">{item.petName}</div>
                    <div className="text-xs text-gray-500">{item.age}, {item.gender}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>{item.type}</div>
                  <div className="text-xs text-gray-500">{item.breed}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold">{item.seller.name}</div>
                  <div className="text-xs">{item.seller.email}</div>
                  <div className="text-xs">{item.seller.contact}</div>
                </td>
                <td className="px-6 py-4 flex items-center gap-1 text-sm">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
                  {item.date}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button className="text-blue-500 hover:scale-110 transition">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button className="text-green-500 hover:scale-110 transition">
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button className="text-red-500 hover:scale-110 transition">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>Showing 1 to {filteredData.length} of {sampleData.length} results</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Previous</button>
          <button className="px-3 py-1 rounded-lg bg-blue-500 text-white">1</button>
          <button className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">2</button>
          <button className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">3</button>
          <button className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">Next</button>
        </div>
      </div>
    </div>
  );
}
