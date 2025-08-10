import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Component/Header";
import Footer from "./Component/Footer";
import Home from "./Pages/Home/Home";
import Category from "./Pages/Category/Category";
import About from "./Pages/About/About";
import Admin from "./Pages/Admin/admin";
import AddProduct from "./Pages/CRUD/AddProduct";
import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import Product from "./Pages/Product/Product";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category" element={<Category />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Product />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/add-product" element={<AddProduct />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Add more routes here */}
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
