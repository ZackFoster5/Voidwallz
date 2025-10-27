import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Voidwallz",
  description:
    "Learn how Voidwallz collects, uses, and protects your information while you explore wallpapers and premium content.",
};

const sections = [
  {
    heading: "Overview",
    body:
      "We respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and the rights you have over your data.",
  },
  {
    heading: "Information We Collect",
    body:
      "We collect account details, usage analytics, and optional profile information to deliver personalized features. We never sell your data and only share it with trusted services needed to run Voidwallz.",
  },
  {
    heading: "How We Use Your Data",
    body:
      "Your information powers authentication, wallpaper recommendations, premium billing, and service improvements. We limit access to authorized team members and service providers bound by confidentiality agreements.",
  },
  {
    heading: "Your Rights",
    body:
      "You can request data exports, corrections, or deletion at any time. Contact us through the support form if you need assistance managing your account or privacy settings.",
  },
  {
    heading: "Contact",
    body:
      "Questions about privacy? Email privacy@voidwallz.com or submit a ticket via our support page. We respond to verified requests within 30 days.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <header className="space-y-4 text-center md:text-left">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-foreground/60">Legal</p>
          <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-wider">
            Privacy Policy
          </h1>
          <p className="text-base md:text-lg text-foreground/70 max-w-3xl">
            Transparency matters. This policy outlines how we safeguard your information while delivering a seamless wallpaper experience.
          </p>
        </header>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-3 border-l-4 border-primary pl-6">
              <h2 className="text-xl font-mono font-bold uppercase tracking-wide text-primary">
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
