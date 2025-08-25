import React from "react";
import { motion } from "framer-motion";

export default function Intro() {
  return (
    <section className="bg-black text-white py-16 md:py-24 relative">
      {/* Background gradient overlay matching other pages */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
      
      <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-12 relative z-10">
        {/* Left Section (Text) */}
        <div className="md:w-1/2 w-full">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-red-600 mb-8 leading-tight"
          >
            Introduction:
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-gray-300 text-lg leading-relaxed">
              <span className="text-red-600 font-semibold">AS Electro-Mechanical Company</span> specializes in the design, installation, maintenance,
              and repair of systems that combine both electrical and mechanical components.
            </p>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              We offer comprehensive solutions for various sectors including construction,
              manufacturing, and energy, focusing on <span className="text-red-600 font-semibold">efficiency, safety, and reliability</span>.
            </p>

            {/* Additional features section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-300">Premium Quality Components</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-300">Expert Installation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-300">24/7 Maintenance Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-300">Industrial Applications</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Section (Image) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="md:w-1/2 w-full flex justify-center relative"
        >
          <div className="relative">
            <img
              src="/home/qr.jpg"
              alt="Electro Mechanical Overview"
              className="rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg object-cover border-2 border-red-600/20"
            />
            {/* Image overlay effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 rounded-full opacity-80"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-600 rounded-full opacity-60"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
