import React from 'react';

const AboutHeroSection = () => {
  return (
    <section className="min-h-[70vh] md:min-h-screen w-full bg-black text-white px-6 sm:px-8 py-16 flex flex-col md:flex-row items-center justify-center gap-10">
      {/* Text Content */}
      <div className="text-center md:text-left md:w-1/2 space-y-6 px-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          <span className="text-red-800">Driven</span> by Passion.{' '}
          <span className="text-red-800">Powered</span> by Precision.
        </h1>
        <p className="text-base sm:text-lg md:text-xl">
          At <span className="font-semibold text-red-800">A.S</span>, we merge innovation and performance to bring you top-tier automotive parts and unmatched customer service.
        </p>
        <button
          className="bg-red-800 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-700 focus:ring-opacity-50 w-full sm:w-auto"
        >
          Learn More
        </button>
      </div>

      {/* About Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src="/pics/about.jpg"
          alt="About A.S - Automotive Parts and Services"
          className="w-full max-w-md h-64 object-cover rounded-xl shadow-lg"
        />
      </div>
    </section>
  );
};

export default AboutHeroSection;
