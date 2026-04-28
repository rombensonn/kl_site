import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/features/HeroSection";
import ProductDefinitionSection from "@/components/features/ProductDefinitionSection";
import HowItWorksSection from "@/components/features/HowItWorksSection";
import UseCasesSection from "@/components/features/UseCasesSection";
import ProblemSection from "@/components/features/ProblemSection";
import SolutionSection from "@/components/features/SolutionSection";
import FeaturesSection from "@/components/features/FeaturesSection";
import AudienceSection from "@/components/features/AudienceSection";
import BenefitsSection from "@/components/features/BenefitsSection";
import DemoSection from "@/components/features/DemoSection";
import FAQSection from "@/components/features/FAQSection";
import WaitlistSection from "@/components/features/WaitlistSection";
import MobileStickyBar from "@/components/features/MobileStickyBar";
import HeroFormOverlay from "@/components/features/HeroFormOverlay";

export default function LandingPage() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const openOverlay = useCallback(() => setOverlayOpen(true), []);

  // Listen for global "open-waitlist-overlay" event from Header / MobileStickyBar
  useEffect(() => {
    const handler = () => openOverlay();
    window.addEventListener("open-waitlist-overlay", handler);
    return () => window.removeEventListener("open-waitlist-overlay", handler);
  }, [openOverlay]);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--dfl-bg)" }}
    >
      <Header />
      <main>
        <HeroSection onOpenOverlay={openOverlay} />
        <ProductDefinitionSection />
        <HowItWorksSection />
        <UseCasesSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <AudienceSection />
        <BenefitsSection />
        <DemoSection />
        <FAQSection />
        <WaitlistSection />
      </main>
      <Footer />
      <MobileStickyBar />

      {/* Global waitlist overlay — opened from Header, MobileStickyBar, Hero */}
      <HeroFormOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </div>
  );
}
