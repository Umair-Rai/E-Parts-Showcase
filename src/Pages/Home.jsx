import React from "react";
import Hero from "../Home/Hero";
import ProductCategories from "../Home/ProductCategories";
import FeaturedProducts from "../Home/FeaturedProducts";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Hero />
      <ProductCategories />
      <FeaturedProducts />
    </div>
  );
};

export default Home;
