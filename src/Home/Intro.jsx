import React from "react";
import { motion } from "framer-motion";

export default function Intro() {
  return (
    <section className="bg-black text-white py-12 md:py-20">
      <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Left Section (Text) */}
        <div className="md:w-1/2 w-full">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-red-600 mb-6"
          >
            Introduction:
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-300 text-lg leading-relaxed"
          >
            AS Electro-Mechanical Company specializes in the design, installation, maintenance,
            and repair of systems that combine both electrical and mechanical components.
            <br /><br />
            We offer comprehensive solutions for various sectors including construction,
            manufacturing, and energy, focusing on efficiency, safety, and reliability.
          </motion.p>
        </div>

        {/* Right Section (Image) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="md:w-1/2 w-full flex justify-center relative"
        >
          <img
            src="/home/qr.jpg"
            alt="Electro Mechanical Overview"
            className="rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
