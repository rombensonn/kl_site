import { useState } from "react";
import PresaleHeader from "@/components/presale/PresaleHeader";
import PresaleHero from "@/components/presale/PresaleHero";
import PresaleOfferCard from "@/components/presale/PresaleOfferCard";
import PresaleTrustSection from "@/components/presale/PresaleTrustSection";
import PresaleHowItWorks from "@/components/presale/PresaleHowItWorks";
import PresaleFAQ from "@/components/presale/PresaleFAQ";
import PresaleReservationForm from "@/components/presale/PresaleReservationForm";
import PresaleFooter from "@/components/presale/PresaleFooter";

const SEATS_LEFT = 47;
const PRESALE_END = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

export default function PresalePage() {
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const scrollToForm = () => {
    document.getElementById("presale-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      <PresaleHeader />
      <main>
        <PresaleHero
          seatsLeft={SEATS_LEFT}
          onCTAClick={scrollToForm}
          targetDate={PRESALE_END}
        />
        <PresaleOfferCard />
        <PresaleTrustSection />
        <PresaleHowItWorks />
        <PresaleFAQ />
        <PresaleReservationForm
          seatsLeft={SEATS_LEFT}
          success={success}
          onSuccess={(data) => {
            setSubmittedEmail(data.email);
            setSuccess(true);
          }}
        />
      </main>
      <PresaleFooter />
    </div>
  );
}
