import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Wrench } from 'lucide-react';

const Contact = () => {

  return (
    <section className="w-full bg-white px-6 py-16 md:px-20">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-black"
        >
          About Al Sayyed Parts
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg"
        >
          Providing reliable water pump solutions to the MENA region with quality, expertise, and fast delivery.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-zinc-100 rounded-2xl p-8 text-center hover:scale-105 hover:shadow-red-800 shadow-lg transition-all duration-300"
        >
          <div className="w-14 h-14 mx-auto flex items-center justify-center bg-red-800 text-white rounded-full mb-4">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">Community Driven</h3>
          <p className="text-gray-600 text-sm">
            We aim to serve not only customers but build long-term relationships based on trust and support.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-zinc-100 rounded-2xl p-8 text-center hover:scale-105 hover:shadow-red-800 shadow-lg transition-all duration-300"
        >
          <div className="w-14 h-14 mx-auto flex items-center justify-center bg-red-800 text-white rounded-full mb-4">
            <Award size={28} />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">Trusted by Thousands</h3>
          <p className="text-gray-600 text-sm">
            Over a decade of consistent service and trust across borders and industries.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="bg-zinc-100 rounded-2xl p-8 text-center hover:scale-105 hover:shadow-red-800 shadow-lg transition-all duration-300"
        >
          <div className="w-14 h-14 mx-auto flex items-center justify-center bg-red-800 text-white rounded-full mb-4">
            <Wrench size={28} />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">Expertise in Every Part</h3>
          <p className="text-gray-600 text-sm">
            Our team ensures every product reflects technical excellence and dependable performance.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
