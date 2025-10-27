import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Voidwallz",
  description:
    "Read the terms governing your use of Voidwallz wallpapers, premium benefits, and community features.",
};

const sections = [
  {
    heading: "Acceptance of Terms",
    body:
      "By browsing or creating an account, you agree to these terms. We may update them to reflect new features, regulations, or policies. Continued use after changes indicates acceptance.",
  },
  {
    heading: "Use of Service",
    body:
      "Voidwallz grants a personal, non-transferable license to download wallpapers for your devices. Commercial redistribution or automated scraping of our catalog is prohibited.",
  },
  {
    heading: "Accounts & Security",
    body:
      "Keep your login credentials confidential. You are responsible for activity on your account. Notify us immediately if you suspect unauthorized access or security issues.",
  },
  {
    heading: "Premium Membership",
    body:
      "Premium fees are billed according to the plan selected. Subscriptions auto-renew unless cancelled. Refund requests are evaluated according to regional consumer laws.",
  },
  {
    heading: "Termination",
    body:
      "We may suspend or terminate access if terms are violated or accounts remain inactive for extended periods. You can delete your account anytime from settings or by contacting support.",
  },
  {
    heading: "Contact",
    body:
      "Questions about these terms? Reach our legal team at legal@voidwallz.com."
  },
];

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <header className="space-y-4 text-center md:text-left">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-foreground/60">Legal</p>
          <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-wider">
            Terms of Service
          </h1>
          <p className="text-base md:text-lg text-foreground/70 max-w-3xl">
            Please review these guidelines to understand the expectations and responsibilities that come with using Voidwallz.
          </p>
        </header>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3 border-l-4 border-secondary pl-6">
              <h2 className="text-xl font-mono font-bold uppercase tracking-wide text-secondary">
                {section.heading}
              </h2>
              <p className="text-foreground/80 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
