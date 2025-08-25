import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

const products = [
  {
    model: "MS-2045",
    name: "Double Mechanical Seal",
    image: "/images/seal.jpg",
    hoverImage: "/images/seal-hover.jpg",
    link: "/products/ms-2045",
  },
  {
    model: "AL-3301",
    name: "Aluminium Pulley",
    image: "/images/pulley.jpg",
    hoverImage: "/images/pulley-hover.jpg",
    link: "/products/al-3301",
  },
  {
    model: "WP-1120",
    name: "Water Pump Impeller",
    image: "/images/impeller.jpg",
    hoverImage: "/images/impeller-hover.jpg",
    link: "/products/wp-1120",
  },
  {
    model: "BR-9002",
    name: "Heavy Duty Bearing",
    image: "/images/bearing.jpg",
    hoverImage: "/images/bearing-hover.jpg",
    link: "/products/br-9002",
  },
  {
    model: "AVR-555",
    name: "Generator AVR",
    image: "/images/avr.jpg",
    hoverImage: "/images/avr-hover.jpg",
    link: "/products/avr-555",
  },
  {
    model: "AG-4500",
    name: "Agricultural Sprayer Pump",
    image: "/images/sprayer.jpg",
    hoverImage: "/images/sprayer-hover.jpg",
    link: "/products/ag-4500",
  },
  {
    model: "PS-002",
    name: "Pressure Switch",
    image: "/images/pressure.jpg",
    hoverImage: "/images/pressure-hover.jpg",
    link: "/products/ps-002",
  },
  {
    model: "VC-700",
    name: "Valve Cover",
    image: "/images/valve.jpg",
    hoverImage: "/images/valve-hover.jpg",
    link: "/products/vc-700",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="px-4 md:px-16 py-12 bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
        <a
          href="/products"
          className="text-blue-600 hover:text-blue-800 text-sm md:text-base font-medium transition-all"
        >
          View All Products →
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-lg hover:shadow-red-800
        overflow-hidden
        transition-transform
        duration-300
        hover:scale-105
      "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="w-full h-48 bg-gray-50 relative">
        <img
          src={hovered ? product.hoverImage : product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-opacity duration-300 ease-in-out"
        />
      </div>

      {/* Text */}
      <div className="p-4 flex flex-col h-full">
        <p className="text-xs text-gray-500">Model: {product.model}</p>
        <h3 className="text-lg font-semibold mt-1">{product.name}</h3>

        <div className="mt-auto flex items-center justify-between pt-4">
          <a
            href={product.link}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all"
          >
            View Details
          </a>
          <a
            href={product.link}
            className="
              inline-flex
              items-center
              justify-center
              w-8
              h-8
              rounded-full
              bg-blue-600
              hover:bg-blue-700
              transition-all
            "
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
}