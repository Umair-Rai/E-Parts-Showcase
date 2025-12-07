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
              At <span className="text-red-600 font-semibold">Electro Mech Solutions</span>, we specialize in designing, manufacturing, and supplying high-quality electromechanical Parts/components trusted by industries around the world. From precision parts of motors Pumps to advanced control systems of commercial and Industrial mechanism, our products power innovation across automation, energy Procesing and manufacturing sectors.
            </p>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              Driven by innovation and built on decades of engineering expertise, we are committed to delivering reliable solutions that enhance <span className="text-red-600 font-semibold">performance, efficiency, and sustainability</span>. Our team of dedicated professionals works closely with clients to provide customized products that meet the most demanding technical requirements.
            </p>

            <p className="text-gray-300 text-lg leading-relaxed">
              With a focus on <span className="text-red-600 font-semibold">quality, precision, and customer satisfaction</span>, Electro Mech Solutions stands at the forefront of modern engineering — where electrical and mechanical excellence come together.
            </p>
          </motion.div>
        </div>

        {/* Right Section (Image) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="md:w-1/2 w-full flex justify-center relative"
        >
          <div 
            className="relative cursor-pointer group transition-transform duration-300 hover:scale-105"
            onClick={() => {
              const phoneNumber = "+966535276218";
              const message = "Hello! I'm interested in your electro-mechanical services.";
              const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            title="Click to contact us on WhatsApp"
          >
            <img
              src="/home/qr.png"
              alt="Electro Mechanical Overview - Click to contact us on WhatsApp"
              className="rounded-2xl shadow-2xl w-full max-w-xs md:max-w-sm object-cover border-2 border-red-600/20 group-hover:border-red-600/40 transition-all duration-300"
            />
            {/* Image overlay effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300"></div>
            
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-600 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
