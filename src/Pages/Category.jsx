import React from "react";
import ProductCategories from "../Home/ProductCategories";
import FeaturedProducts from "../Home/FeaturedProducts";

const Category = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <ProductCategories />
      <FeaturedProducts />
    </div>
  );
};

export default Category;
