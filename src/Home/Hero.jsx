import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Hero() {
  const slides = [
    "https://source.unsplash.com/1600x900/?water-pump",
    "https://source.unsplash.com/1600x900/?industrial",
    "https://source.unsplash.com/1600x900/?machinery",
    "https://source.unsplash.com/1600x900/?factory",
    "https://source.unsplash.com/1600x900/?mechanical",
  ];

  return (
    <div className="relative h-[90vh] w-full overflow-hidden">
      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        className="h-full w-full"
      >
        {slides.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${url})`,
              }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button
        className="swiper-button-prev-custom z-30 absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all"
        aria-label="Previous Slide"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="swiper-button-next-custom z-30 absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all"
        aria-label="Next Slide"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Premium Quality Water Pump Parts
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mt-4 max-w-2xl">
          Supplier of high-quality mechanical and electrical water pump components for industrial applications.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button className="bg-white text-slate-900 font-semibold px-6 py-3 rounded hover:bg-gray-200 transition-all">
            Browse Products
          </button>
          <button className="border border-white text-white font-semibold px-6 py-3 rounded hover:bg-white hover:text-slate-900 transition-all">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
