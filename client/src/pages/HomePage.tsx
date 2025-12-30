import ChatToggle from "../components/ChatToggle"
import FAQSection from "../components/FAQSection"
import Hero from "../components/Hero"
import PricingCTA from "../components/PricingCTA"
import PricingSection from "../components/PricingSection"
import ServicesSection from "../components/ServicesSection"
import TestimonialsSection from "../components/TestimonialsSection"

function HomePage() {
    return (
        <main>
            <Hero />
            <PricingSection />
            <ServicesSection />
            <TestimonialsSection />
            <PricingCTA />
            <FAQSection />
        </main>
    )
}
export default HomePage