import React from "react";

export const categories = [
  {
    title: "GenSet Parts and Components",
    description: "Essential components for generator systems.",
    image1: "/pics/avr1.jpg",
    image2: "/pics/avr2.jpg",
  },
  {
    title: "Mechanical Seals",
    description: "Reliable sealing solutions for industrial use.",
    image1: "/pics/mechanical_seal1.jpg",
    image2: "/pics/mechanical_seal2.jpg",
  },
  {
    title: "Water Pump Parts",
    description: "Durable parts for high-performance pumps.",
    image1: "/pics/motor_pump1.jpg",
    image2: "/pics/motor_pump2.jpg",
  },
  {
    title: "Pulleys",
    description: "Precision-engineered aluminum pulleys.",
    image1: "/pics/pully1.jpg",
    image2: "/pics/pully2.jpg",
  },
  {
    title: "Agricultural Parts",
    description: "Specialized parts for farming equipment.",
    image1: "/pics/Agricultural_Parts1.jpg",
    image2: "/pics/Agricultural_Parts2.jpg",
    highlight: true,
  },
  {
    title: "Bearings",
    description: "High-efficiency rolling bearings for machines.",
    image1: "/pics/Bearings1.jpg",
    image2: "/pics/Bearings2.jpg",
  },
];

export default function ProductCategories() {
  return (
    <section className="px-4 md:px-16 py-12 bg-gray-100">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold">Product Categories</h2>
        <p className="text-gray-600 text-sm md:text-base mt-2">
          Explore our wide range of high-quality components.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`group
              bg-white
              rounded-xl
              shadow-lg hover:shadow-red-800
              overflow-hidden
              transition-all
              duration-500
              hover:scale-105
              ${cat.highlight ? "ring-2 ring-blue-500" : ""}
            `}
          >
            {/* Image Container */}
            <div className="relative w-full h-64 bg-white">
              {/* First Image */}
              <img
                src={cat.image1}
                alt={cat.title}
                className="w-full h-full object-contain absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100 group-hover:opacity-0"
              />
              {/* Second Image */}
              <img
                src={cat.image2}
                alt={cat.title}
                className="w-full h-full object-contain absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100"
              />
            </div>

            {/* Text Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{cat.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              <a
                href="#"
                className="inline-block mt-3 text-blue-600 hover:text-blue-800  transition-all text-sm font-medium"
              >
                View Products →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
