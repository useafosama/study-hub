import { getCurrentUser } from "@/lib/auth/session";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { QuickGuide } from "@/components/landing/quick-guide";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function HomePage() {
  const session = await getCurrentUser();

  const sessionUser = session
    ? {
        isAdmin: session.isAdmin,
        name: session.profile.full_name || session.profile.username,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Navigation Header */}
      <LandingNavbar sessionUser={sessionUser} />

      {/* Main Sections */}
      <main className="flex-1">
        <HeroSection sessionUser={sessionUser} />
        <FeaturesGrid />
        <QuickGuide />
        <FAQSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
