import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PricingSection from './components/PricingSection';
import ServicesSection from './components/ServicesSection';
import TestimonialsSection from './components/TestimonialsSection';
import PricingCTA from './components/PricingCTA';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import LiveChat from './components/LiveChat';
import ChatToggle from './components/ChatToggle';

function App() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <Hero />
        <PricingSection />
        <ServicesSection />
        <TestimonialsSection />
        <PricingCTA />
        <FAQSection />
        
        {/* Add Chat Toggle Button in Hero or elsewhere */}
        <div className="container-custom py-8 text-center">
          <ChatToggle />
        </div>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}

export default App;