import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import Hero from "@/app/components/sections/Hero";
import Stats from "@/app/components/sections/Stats";
import Team from "@/app/components/sections/Team";
import Specialists from "@/app/components/sections/Specialists";
import CTA from "@/app/components/sections/CTA";
import Testimonials from "@/app/components/sections/Testimonials";

/**
 * Landing Page — assembles all sections into a complete page.
 * Each section is a self-contained component with its own animations.
 */
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Team />
      <Specialists />
      <CTA />
      <Testimonials />
      <Footer />
    </main>
  );
}
