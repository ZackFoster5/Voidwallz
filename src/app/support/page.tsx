"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { FadeInUp } from "@/components/scroll-animations";

type TicketType = "bug" | "suggestion" | "issue" | "other";
type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function SupportPage() {
  const [ticketType, setTicketType] = useState<TicketType>("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in and pre-fill email/name
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserLoggedIn(true);
        setEmail(user.email || "");
        setName(
          user.user_metadata?.firstName
            ? `${user.user_metadata.firstName} ${user.user_metadata.lastName || ""}`
            : "",
        );
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    // Validate form
    if (!email || !subject || !description) {
      setStatus("error");
      setMessage("Please fill in all required fields");
      return;
    }

    // Get browser and device info
    const browserInfo = navigator.userAgent;
    const deviceInfo = `${window.screen.width}x${window.screen.height} - ${navigator.platform}`;

    try {
      // Get current user ID if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert ticket into database
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user?.id || null,
        user_email: email,
        user_name: name || null,
        ticket_type: ticketType,
        subject: subject,
        description: description,
        browser_info: browserInfo,
        device_info: deviceInfo,
        status: "open",
        priority: "medium",
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      setMessage(
        "Your ticket has been submitted successfully! We'll get back to you soon.",
      );

      // Reset form
      setTimeout(() => {
        setSubject("");
        setDescription("");
        if (!userLoggedIn) {
          setEmail("");
          setName("");
        }
        setTicketType("bug");
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setStatus("error");
      setMessage("Failed to submit ticket. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FadeInUp>
          <div className="text-center mb-8 md:mb-12">
            <div className="h-[80px] md:h-[160px] flex items-center justify-center mb-2 md:mb-4">
              <TextHoverEffect text="SUPPORT" />
            </div>
            <p className="text-sm md:text-lg text-foreground/70 max-w-2xl mx-auto">
              Found a bug? Have a suggestion? Let us know and we&apos;ll get
              back to you.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className="card-brutalist p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ticket Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-mono uppercase tracking-wide text-foreground font-bold">
                  What can we help you with? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "bug", label: "Bug Report", icon: "bug" },
                    {
                      value: "suggestion",
                      label: "Suggestion",
                      icon: "lightbulb",
                    },
                    {
                      value: "issue",
                      label: "Issue",
                      icon: "exclamation-circle",
                    },
                    { value: "other", label: "Other", icon: "chat-bubble" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setTicketType(type.value as TicketType)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 border-2 border-foreground font-mono uppercase text-xs transition-all duration-200",
                        "hover:translate-x-[2px] hover:translate-y-[2px]",
                        ticketType === type.value
                          ? "bg-primary text-background shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                          : "bg-card hover:bg-primary hover:text-background shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                      )}
                    >
                      <Icon name={type.icon as IconName} className="w-6 h-6" />
                      <span className="text-center">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-mono uppercase tracking-wide text-foreground/70">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={userLoggedIn}
                    className={cn(
                      "w-full px-4 py-3 border-2 border-foreground bg-background text-foreground font-mono",
                      "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                      "focus:outline-none focus:bg-card",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-mono uppercase tracking-wide text-foreground/70">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={userLoggedIn && !!name}
                    className={cn(
                      "w-full px-4 py-3 border-2 border-foreground bg-background text-foreground font-mono",
                      "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                      "focus:outline-none focus:bg-card",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="block text-sm font-mono uppercase tracking-wide text-foreground/70">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                  maxLength={200}
                  className={cn(
                    "w-full px-4 py-3 border-2 border-foreground bg-background text-foreground font-mono",
                    "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                    "focus:outline-none focus:bg-card",
                  )}
                />
                <div className="text-xs font-mono text-foreground/60 text-right">
                  {subject.length}/200
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-mono uppercase tracking-wide text-foreground/70">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Please provide detailed information:\n\n${
                    ticketType === "bug"
                      ? "- What were you doing when the bug occurred?\n- What did you expect to happen?\n- What actually happened?\n- Steps to reproduce (if possible)"
                      : ticketType === "suggestion"
                        ? "- What feature would you like to see?\n- How would it improve your experience?\n- Any specific ideas on implementation?"
                        : "- Describe your issue in detail\n- What page/feature does this affect?\n- Any additional context"
                  }`}
                  required
                  rows={8}
                  maxLength={2000}
                  className={cn(
                    "w-full px-4 py-3 border-2 border-foreground bg-background text-foreground font-mono text-sm",
                    "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                    "focus:outline-none focus:bg-card resize-none",
                  )}
                />
                <div className="text-xs font-mono text-foreground/60 text-right">
                  {description.length}/2000
                </div>
              </div>

              {/* Info Box */}
              <div className="border-2 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                <div className="flex items-start gap-3">
                  <Icon name="info" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-xs font-mono text-foreground/80 space-y-1">
                    <p>
                      <strong>Note:</strong> Browser and device information will
                      be collected automatically to help us diagnose issues.
                    </p>
                    <p className="text-foreground/60">
                      We typically respond within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {message && (
                <div
                  className={cn(
                    "border-2 border-foreground p-4 font-mono text-sm",
                    "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                    status === "success"
                      ? "bg-green-500/10 text-green-600 border-green-600"
                      : "bg-red-500/10 text-red-600 border-red-600",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name={
                        status === "success" ? "check" : "exclamation-circle"
                      }
                      className="w-5 h-5"
                    />
                    <span>{message}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "submitting"}
                className={cn(
                  "w-full px-6 py-4 border-2 border-foreground bg-primary text-background font-mono font-bold uppercase tracking-wide text-lg",
                  "shadow-[6px_6px_0px_0px_var(--color-foreground)]",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0",
                )}
              >
                {status === "submitting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </form>
          </div>
        </FadeInUp>

        {/* FAQ Section */}
        <FadeInUp delay={0.3}>
          <div className="mt-12 card-brutalist p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold font-mono uppercase tracking-wide mb-6 flex items-center gap-2">
              <Icon name="question-circle" className="w-6 h-6" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "How long does it take to get a response?",
                  a: "We typically respond to all tickets within 24-48 hours. Urgent issues are prioritized.",
                },
                {
                  q: "Can I attach screenshots?",
                  a: "Screenshot upload feature is coming soon! For now, you can host images externally and include links in your description.",
                },
                {
                  q: "How do I check the status of my ticket?",
                  a: "If you&apos;re logged in, you can view your ticket history in your profile. We&apos;ll also email you when there are updates.",
                },
                {
                  q: "What if my issue is urgent?",
                  a: "For critical bugs affecting many users, we respond as quickly as possible. Please include &apos;URGENT&apos; in your subject line.",
                },
              ].map((faq, i) => (
                <div key={i} className="border-l-4 border-foreground pl-4 py-2">
                  <h3 className="font-mono font-bold text-sm mb-1">{faq.q}</h3>
                  <p className="font-mono text-xs text-foreground/70">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
