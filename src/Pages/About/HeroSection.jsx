import React from 'react';

const AboutHeroSection = () => {
  return (
    <section className="min-h-screen w-full bg-black text-white px-8 py-16 flex flex-col md:flex-row items-center justify-center gap-10">
      {/* Text Content */}
      <div className="text-center md:text-left md:w-1/2 space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-red-800">Driven</span> by Passion.{' '}
          <span className="text-red-800">Powered</span> by Precision.
        </h1>
        <p className="text-lg md:text-xl">
          At <span className="font-semibold text-red-800">A.S</span>, we merge innovation and performance to bring you top-tier automotive parts and unmatched customer service.
        </p>
        <button
          className="bg-red-800 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-700 focus:ring-opacity-50"
        >
          Learn More
        </button>
      </div>

      {/* Optional Image or Logo Placeholder */}
      <div className="hidden md:block md:w-1/2">
        {/* You can place a logo or image here */}
        <div className="w-full h-64 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
          Image Placeholder
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
