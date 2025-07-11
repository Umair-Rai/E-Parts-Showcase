import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import ProductCategories from "./components/ProductCategories";
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Hero />
      <ProductCategories />
      <Footer />
    </div>
  );
}

export default App;
