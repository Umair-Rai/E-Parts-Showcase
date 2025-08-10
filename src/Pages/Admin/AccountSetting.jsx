import React from 'react';

const AccountSettings = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-inter">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold">Account Settings</h2>
        <p className="text-gray-500">Manage your personal information, security and preferences.</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h3 className="text-xl font-semibold">Personal Information</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="rounded-full w-24 h-24 object-cover border shadow"
          />
          <button className="text-blue-600 hover:underline">Upload a new profile picture</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Admin Name"
            className="border rounded-xl px-4 py-3 h-12 w-full focus:outline-none focus:ring focus:border-blue-400 transition"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="border rounded-xl px-4 py-3 h-12 w-full focus:outline-none focus:ring focus:border-blue-400 transition"
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="border rounded-xl px-4 py-3 h-12 w-full focus:outline-none focus:ring focus:border-blue-400 transition"
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg mt-4">
          Save Changes
        </button>
      </div>

      {/* Password & Security */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-xl font-semibold">Password & Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="password"
            placeholder="Old Password"
            className="border rounded-xl px-4 py-3 h-12 w-full focus:outline-none focus:ring focus:border-blue-400 transition"
          />
          <input
            type="password"
            placeholder="New Password"
            className="border rounded-xl px-4 py-3 h-12 w-full focus:outline-none focus:ring focus:border-blue-400 transition"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="border rounded-xl px-4 py-3 h-12 w-full focus:outline-none focus:ring focus:border-blue-400 transition md:col-span-2"
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg mt-4">
          Save Password
        </button>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h3 className="text-xl font-semibold">Account Actions</h3>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <button className="bg-gray-200 text-black px-6 py-3 rounded-xl hover:bg-gray-300 transition">
            Logout
          </button>
          <button className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition">
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
