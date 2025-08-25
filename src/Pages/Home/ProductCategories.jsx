import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useNavigate } from "react-router-dom";

export default function ProductCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/categories");
      console.log('📊 Fetched categories:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      toast.error("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Process category images
  const getCategoryImages = (category) => {
    if (!category.pic) return [];
    
    let imageArray = [];
    
    try {
      if (Array.isArray(category.pic)) {
        imageArray = category.pic;
      } else if (typeof category.pic === 'string') {
        if (category.pic.startsWith('{') && category.pic.endsWith('}')) {
          // Handle Postgres TEXT[] format: {"url1","url2"}
          const cleanedString = category.pic
            .replace(/[{}"]/g, '') // Remove {, }, and " characters
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);
          imageArray = cleanedString;
        } else {
          try {
            imageArray = JSON.parse(category.pic);
          } catch {
            imageArray = [category.pic];
          }
        }
      }
    } catch (error) {
      console.error('Error processing category images:', error);
      return [];
    }

    // Construct full URLs
    const constructedUrls = imageArray.map(imagePath => {
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `http://localhost:5000${cleanPath}`;
    });

    return constructedUrls;
  };

  // Check if category is special
  const isSpecialCategory = (category) => {
    return category.special_category === true;
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/product?category=${categoryId}`);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="px-4 md:px-16 py-12 bg-black">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-16 py-12 bg-black">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-red-600">Product Categories</h2>
        <p className="text-gray-300 text-sm md:text-base mt-2">
          Explore our wide range of high-quality components.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
          <Squares2X2Icon className="h-5 w-5 text-red-600" />
          <span>{categories.length} Categories Available</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const images = getCategoryImages(category);
          const isSpecial = isSpecialCategory(category);
          
          return (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`group
                bg-gray-900
                rounded-xl
                shadow-lg hover:shadow-red-800/50
                overflow-hidden
                transition-all
                duration-500
                hover:scale-105
                cursor-pointer
                border border-gray-700
                hover:border-red-600
                ${isSpecial ? "ring-2 ring-red-500" : ""}
              `}
            >
              {/* Image Container */}
              <div className="relative w-full h-64 bg-gray-800 overflow-hidden">
                {images.length >= 2 ? (
                  <>
                    {/* First Image */}
                    <img
                      src={images[0]}
                      alt={category.name}
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100 group-hover:opacity-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Second Image */}
                    <img
                      src={images[1]}
                      alt={category.name}
                      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </>
                ) : images.length === 1 ? (
                  <img
                    src={images[0]}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Squares2X2Icon className="h-16 w-16 text-gray-600" />
                  </div>
                )}
                
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Special Category Badge */}
                {isSpecial && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                    Featured
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Discover our {category.name.toLowerCase()} collection
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="inline-flex items-center text-red-400 hover:text-red-300 transition-all text-sm font-medium">
                    View Products
                    <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-16">
          <Squares2X2Icon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No categories found</h3>
          <p className="text-gray-500">
            Categories will appear here once they are added to the database.
          </p>
        </div>
      )}
    </section>
  );
}