import React from 'react';
import { ShieldCheck, Headset, Zap } from 'lucide-react';

const CoreValuesSection = () => {
  const values = [
    {
      title: 'Quality First',
      icon: <ShieldCheck size={32} />,
      description:
        'We ensure every part meets the highest standards of quality and durability so your vehicle performs at its best.',
    },
    {
      title: 'Reliable Support',
      icon: <Headset size={32} />,
      description:
        'Our support team is always ready to help, offering expert guidance and prompt assistance.',
    },
    {
      title: 'Fast Delivery',
      icon: <Zap size={32} />,
      description:
        'Speed matters. We prioritize fast and secure shipping so you get your parts when you need them.',
    },
  ];

  return (
    <section className="w-full bg-white px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-black">Why Choose Us</h2>
        <p className="text-gray-600 text-lg mt-2">What drives our brand forward</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {values.map((value, index) => (
          <div
            key={index}
            className="bg-zinc-100 rounded-2xl p-8 text-center hover:scale-105 hover:shadow-red-800 shadow-lg transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-red-800 text-white rounded-full mb-4">
              {value.icon}
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">{value.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreValuesSection;
