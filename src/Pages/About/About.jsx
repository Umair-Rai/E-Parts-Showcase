import React from "react";
import AboutHeroSection from "./HeroSection";
import CoreValuesSection from "./CoreValuesSection";
import Contact from "./Contact";

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
