import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  UsersIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Badge from '../../Component/Badge';
import Input from '../../Component/Input';
import Select from '../../Component/Select';
import "react-toastify/dist/ReactToastify.css";

const AccountSettings = () => {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const adminId = adminData?.id;

  // Current admin state - Fixed field names to match database schema
  const [admin, setAdmin] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  
  // Admin management state - Fixed field names
  const [allAdmins, setAllAdmins] = useState([]);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin"
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Load current admin info and all admins
  useEffect(() => {
    if (!adminToken || !adminId) {
      navigate("/admin/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current admin - Fixed API endpoint
        const adminRes = await axios.get(`http://localhost:5000/api/admin/${adminId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setAdmin(adminRes.data);
        
        // Fetch all admins - Fixed API endpoint
        const allAdminsRes = await axios.get('http://localhost:5000/api/admin', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setAllAdmins(allAdminsRes.data);
      } catch (err) {
        toast.error("❌ Failed to fetch admin data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [adminId, adminToken, navigate]);

  const handleProfileUpdate = async () => {
    try {
      // Fixed API endpoint and field names
      await axios.put(`http://localhost:5000/api/admin/${adminId}`, admin, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      toast.success("✅ Profile updated successfully");
      
      // Update localStorage
      const updatedAdminData = { ...adminData, ...admin };
      localStorage.setItem("adminData", JSON.stringify(updatedAdminData));
    } catch (err) {
      toast.error("❌ Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    const { old, new: newPass, confirm } = passwords;
    if (!old || !newPass || !confirm) {
      return toast.error("❗ Please fill all password fields");
    }
    if (newPass !== confirm) {
      return toast.error("❌ New passwords do not match");
    }
    if (newPass.length < 6) {
      return toast.error("❌ Password must be at least 6 characters long");
    }

    try {
      // Fixed API endpoint
      await axios.put(
        `http://localhost:5000/api/admin/${adminId}`,
        { password: newPass },
        { 
          headers: { 
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      toast.success("✅ Password updated successfully");
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        toast.error("❌ Request timeout - server not responding");
      } else {
        toast.error(err?.response?.data?.error || "❌ Failed to update password");
      }
    }
  };

  const handleCreateAdmin = async () => {
    const { name, email, password, confirmPassword, role } = newAdmin;
    
    if (!name || !email || !password || !confirmPassword) {
      return toast.error("❗ Please fill all fields");
    }
    if (password !== confirmPassword) {
      return toast.error("❌ Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("❌ Password must be at least 6 characters long");
    }

    try {
      // Fixed API endpoint and field names to match database schema
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role
      }, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      toast.success("✅ Admin account created successfully");
      setNewAdmin({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin"
      });
      setShowCreateAdmin(false);
      
      // Refresh admin list
      const allAdminsRes = await axios.get('http://localhost:5000/api/admin', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setAllAdmins(allAdminsRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Failed to create admin account");
    }
  };

  const handleDeleteAdmin = async (adminIdToDelete) => {
    if (adminIdToDelete === adminId) {
      return toast.error("❌ You cannot delete your own account from here");
    }
    
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete this admin account permanently?");
    if (!confirmDelete) return;

    try {
      // Fixed API endpoint
      await axios.delete(`http://localhost:5000/api/admin/${adminIdToDelete}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      toast.success("✅ Admin account deleted successfully");
      
      // Refresh admin list
      const allAdminsRes = await axios.get('http://localhost:5000/api/admin', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setAllAdmins(allAdminsRes.data);
    } catch (err) {
      toast.error("❌ Failed to delete admin account");
    }
  };

  const handleDeleteOwnAccount = async () => {
    const confirmDelete = window.confirm("⚠️ Are you sure you want to delete your account permanently? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/${adminId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      toast.success("✅ Account deleted successfully");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      navigate("/admin/login");
    } catch (err) {
      toast.error("❌ Failed to delete account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Cog6ToothIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        </div>
        <p className="text-gray-600">Manage your admin account and system administrators.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'profile', label: 'Profile Settings', icon: UserIcon },
          { id: 'password', label: 'Password & Security', icon: KeyIcon },
          // Only show Admin Management tab for super admin
          ...(adminData?.role === 'super admin' ? [{ id: 'admins', label: 'Admin Management', icon: UsersIcon }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                type="text"
                value={admin.name}
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={admin.email}
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleProfileUpdate}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Password & Security Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <KeyIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Change Password</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.old ? "text" : "password"}
                    value={passwords.old}
                    onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.old ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePasswordChange}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition mt-6"
            >
              Update Password
            </button>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Logout</h3>
                  <p className="text-sm text-gray-600">Sign out of your admin account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your admin account</p>
                </div>
                <button
                  onClick={handleDeleteOwnAccount}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Management Tab */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Create New Admin */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UsersIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Admin Management</h2>
              </div>
              <button
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <PlusIcon className="h-4 w-4" />
                Add New Admin
              </button>
            </div>

            {showCreateAdmin && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Create New Admin Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Admin Name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Admin Email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateAdmin}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Create Admin
                  </button>
                  <button
                    onClick={() => setShowCreateAdmin(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Admin List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">All Administrators</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allAdmins.map((adminUser) => (
                    <tr key={adminUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {adminUser.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{adminUser.name}</div>
                            <div className="text-sm text-gray-500">{adminUser.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge text={adminUser.role} status="verified" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge text="Active" status="verified" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {adminUser.id !== adminId && (
                          <button
                            onClick={() => handleDeleteAdmin(adminUser.id)}
                            className="text-red-600 hover:text-red-900 transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
