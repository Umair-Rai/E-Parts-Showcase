import React from "react";
import { motion } from "framer-motion";

export default function Intro() {
  return (
    <div className="flex flex-col md:flex-row bg-black text-white min-h-screen">
      {/* Left Section (Text) */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl text-red-700 font-bold mb-6"
        >
          Introduction:
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg text-red-700 leading-relaxed"
        >
          AS electro-mechanical company specializes in the design, installation,
          maintenance and repair of systems that combine both electrical and
          mechanical components.
          <br />
          <br />
          We offer comprehensive solutions for various sectors including
          construction, manufacturing, and energy, focusing on efficiency,
          safety and reliability.
        </motion.p>
      </div>

      {/* Right Section (White Box with Animation) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-white text-black relative cursor-alias"
      >
        <div className="text-center space-y-3">
          <motion.h2
            className="text-3xl md:text-4xl font-semibold"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            PICTURES FLASHING
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl font-medium"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            Ref A by whatsapp
          </motion.p>
        </div>

        {/* Cursor Instruction */}
        <div className="absolute -top-4 right-4 text-xs text-black">
          <span>on cursor should change as ref</span>
        </div>
      </motion.div>
    </div>
  );
}
