import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Hero() {
  const slides = [
    "/home/p1.jpg",
    "/home/p2.jpg",
    "/home/p3.jpg",
    "/home/p4.jpg",
    "/home/p5.jpg",
    "/home/p6.jpg",
  ];

  // Function to handle Browse Products button click - scroll to ProductCategories section
  const handleBrowseProducts = () => {
    const productCategoriesSection = document.getElementById('product-categories-section');
    if (productCategoriesSection) {
      productCategoriesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Function to handle Learn More button click with smooth scroll
  const handleLearnMore = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative h-[90vh] w-full overflow-hidden bg-black">
      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{ 
          clickable: true,
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active bg-red-600'
        }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        className="h-full w-full"
      >
        {slides.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="h-full w-full relative">
              <img
                src={url}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
              {/* Enhanced overlay with gradient matching other pages */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/50 z-10"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons - Enhanced styling */}
      <button
        className="swiper-button-prev-custom z-30 absolute top-1/2 left-4 -translate-y-1/2 bg-black/60 hover:bg-red-600/80 border border-red-600/30 hover:border-red-600 p-3 rounded-full transition-all duration-300 group"
        aria-label="Previous Slide"
      >
        <svg
          className="w-5 h-5 text-red-600 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="swiper-button-next-custom z-30 absolute top-1/2 right-4 -translate-y-1/2 bg-black/60 hover:bg-red-600/80 border border-red-600/30 hover:border-red-600 p-3 rounded-full transition-all duration-300 group"
        aria-label="Next Slide"
      >
        <svg
          className="w-5 h-5 text-red-600 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Overlay Content - Updated to match theme */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-red-600 drop-shadow-lg mb-6 leading-tight">
            Premium Quality Water Pump Parts
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto drop-shadow-sm leading-relaxed">
            Supplier of high-quality mechanical and electrical water pump components for industrial applications.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleBrowseProducts}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Products
            </button>
            <button 
              onClick={handleLearnMore}
              className="bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Additional styling for pagination bullets */}
      <style jsx>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.3) !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background: #dc2626 !important;
        }
      `}</style>
    </div>
  );
}
