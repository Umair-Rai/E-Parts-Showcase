import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./context/AuthContext";
import Header from "./Component/Header";
import Footer from "./Component/Footer";
import Home from "./Pages/Home/Home";
import Category from "./Pages/Category/Category";
import About from "./Pages/About/About";
import Admin from "./Pages/Admin/admin";
import AddProduct from "./Pages/CRUD/AddProduct";
import AddCategory from "./Pages/CRUD/AddCategory";
import UpdateProduct from "./Pages/CRUD/UpdateProduct";
import UpdateCategory from "./Pages/CRUD/UpdateCategory";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import ProductCatalog from "./Pages/Product/product";
import ProductDetail from "./Pages/Product/ProductDetail";
import AdminLogin from "./Pages/Admin/Adminlogin";
import AdminRoute from "./Component/AdminRoutes";
import CustomerRoute from "./Component/CustomerRoute";
import Profile from "./Pages/Profile/profile";
import Cart from "./Pages/Cart/Cart";

// Component to conditionally render Footer
function AppContent() {
  const location = useLocation();
  
  // Hide footer on admin pages (except admin login page)
  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  
  return (
    <div className="App">
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} />
        <Route path="/about" element={<About />} />
        <Route path="/product" element={<ProductCatalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Customer Routes */}
        <Route path="/profile" element={
          <CustomerRoute>
            <Profile />
          </CustomerRoute>
        } />
        
        <Route path="/cart" element={
          <CustomerRoute>
            <Cart />
          </CustomerRoute>
        } />
        
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        
        {/* Protected CRUD Routes */}
        <Route path="/admin/add-product" element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        } />
        <Route path="/admin/add-category" element={
          <AdminRoute>
            <AddCategory />
          </AdminRoute>
        } />
        <Route path="/admin/update-product/:productId" element={
          <AdminRoute>
            <UpdateProduct />
          </AdminRoute>
        } />
        <Route path="/admin/update-category/:categoryId" element={
          <AdminRoute>
            <UpdateCategory />
          </AdminRoute>
        } />
      </Routes>
      {!isAdminPage && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        enableMultiContainer={false}
        limit={5}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
