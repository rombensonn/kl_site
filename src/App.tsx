
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "@/pages/LandingPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import ConsentPage from "@/pages/ConsentPage";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import PrivateRoute from "@/components/layout/PrivateRoute";
import TermsPage from "@/pages/TermsPage";
import SettingsPage from "@/pages/SettingsPage";
import BalanceHistoryPage from "@/pages/BalanceHistoryPage";
import CharacterNewPage from "@/pages/CharacterNewPage";
import CharacterPage from "@/pages/CharacterPage";
import BrandBriefPage from "@/pages/BrandBriefPage";
import GeneratePhotoPage from "@/pages/GeneratePhotoPage";
import GenerateVideoPage from "@/pages/GenerateVideoPage";
import GenerateMotionPage from "@/pages/GenerateMotionPage";
import GalleryPage from "@/pages/GalleryPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectNewPage from "@/pages/ProjectNewPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import SupportPage from "@/pages/SupportPage";
import PricingPage from "@/pages/PricingPage";
import PublicOfferPage from "@/pages/PublicOfferPage";
import EulaPage from "@/pages/EulaPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import CookieBanner from "@/components/features/CookieBanner";
import PresalePage from "@/pages/PresalePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollProgress() {
  useEffect(() => {
    const el = document.getElementById("scroll-progress");
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const total = document.body.scrollHeight - window.innerHeight;
          const progress = total > 0 ? scrolled / total : 0;
          if (el) el.style.transform = `scaleX(${progress})`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return null;
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "var(--dfl-bg)" }}>
      <div className="text-7xl font-display font-bold mb-4" style={{ color: "var(--dfl-surface-3)" }}>404</div>
      <h1 className="text-xl font-semibold mb-3" style={{ color: "var(--dfl-text-hi)" }}>Страница не найдена</h1>
      <p className="text-sm mb-6" style={{ color: "var(--dfl-text-subtle)" }}>Запрошенная страница не существует.</p>
      <a href="/" className="btn-primary">На главную</a>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <ThemeProvider>
      <BrowserRouter basename="/kl_site">
        <ScrollProgress />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--dfl-surface-2)",
              border: "1px solid var(--dfl-border-2)",
              color: "var(--dfl-text-hi)",
            },
          }}
        />
        <div id="scroll-progress" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/balance/history" element={<PrivateRoute><BalanceHistoryPage /></PrivateRoute>} />
          <Route path="/character/new" element={<PrivateRoute><CharacterNewPage /></PrivateRoute>} />
          <Route path="/character" element={<PrivateRoute><CharacterPage /></PrivateRoute>} />
          <Route path="/brand-brief" element={<PrivateRoute><BrandBriefPage /></PrivateRoute>} />
          <Route path="/generate/photo" element={<PrivateRoute><GeneratePhotoPage /></PrivateRoute>} />
          <Route path="/generate/video" element={<PrivateRoute><GenerateVideoPage /></PrivateRoute>} />
          <Route path="/generate/motion" element={<PrivateRoute><GenerateMotionPage /></PrivateRoute>} />
          <Route path="/gallery" element={<PrivateRoute><GalleryPage /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
          <Route path="/projects/new" element={<PrivateRoute><ProjectNewPage /></PrivateRoute>} />
          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
          <Route path="/projects/:id/overview" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
          <Route path="/projects/:id/generations" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
          <Route path="/projects/:id/settings" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/presale" element={<PresalePage />} />
          <Route path="/public-offer" element={<PublicOfferPage />} />
          <Route path="/eula" element={<EulaPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </BrowserRouter> {/* Closing tag was missing here */}
    </ThemeProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}
