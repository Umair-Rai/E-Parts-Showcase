import React from "react";
import AboutHeroSection from "../About/HeroSection";
import CoreValuesSection from "../About/CoreValuesSection";
import Contact from "../About/Contact";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <AboutHeroSection />
      <CoreValuesSection />
      <Contact />
    </div>
  );
};

export default About;
