"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/modal";
import { supabase } from "@/lib/supabase-client";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "signup" | "signin";
}

type GateState = "idle" | "success" | "error";

export default function SignupModal({
  open,
  onClose,
  defaultTab = "signup",
}: SignupModalProps) {
  const [tab, setTab] = useState<"signup" | "signin">(defaultTab);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [status, setStatus] = useState<GateState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('savedLoginCredentials')
    if (savedCreds) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(atob(savedCreds))
        setEmail(savedEmail)
        setPassword(savedPassword)
        setRememberMe(true)
        setHasSavedCredentials(true)
      } catch (e) {
        // Invalid saved data, clear it
        localStorage.removeItem('savedLoginCredentials')
      }
    }
  }, [])

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setShowPwd(false);
    setShowConfirm(false);
    setShowLoginPwd(false);
    setRememberMe(false);
    setHasSavedCredentials(false);
    setStatus("idle");
    setMessage(null);
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setMessage(null);

    if (password.length < 6)
      return (
        setStatus("error"),
        setMessage("Password must be at least 6 characters")
      );
    if (password !== confirm)
      return (setStatus("error"), setMessage("Passwords do not match"));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { firstName, lastName } },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      // If email confirmation is disabled in Supabase, a session will be returned
      if (data?.session) {
        setStatus("success");
        setMessage("Account created — redirecting...");
        setTimeout(() => {
          window.location.href = "/profile";
        }, 600);
      } else {
        setStatus("success");
        setMessage("Check your email to confirm your account. Then sign in.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setMessage(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      if (!data.session) {
        setStatus("error");
        setMessage("No session created");
        return;
      }
      // Save credentials if remember me is checked
      if (rememberMe) {
        const encodedCreds = btoa(JSON.stringify({ email, password }))
        localStorage.setItem('savedLoginCredentials', encodedCreds)
      } else {
        localStorage.removeItem('savedLoginCredentials')
      }
      
      setStatus("success");
      setMessage("Logged in successfully");
      setTimeout(() => {
        window.location.href = "/profile";
      }, 700);
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  };

  const signInWithProvider = async (provider: "google" | "apple") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/profile` },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
      }
    } catch {
      setStatus("error");
      setMessage("OAuth error");
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      className="rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-2xl max-w-md md:max-w-lg"
    >
      <div className="p-4 text-white">
        {/* Tabs */}
        <div className="mx-auto mb-6 flex w-full justify-center">
          <div className="inline-flex rounded-full border border-white/20 bg-black/30 overflow-hidden">
            <button
              onClick={() => {
                setTab("signup");
                setStatus("idle");
                setMessage(null);
              }}
              className={cn(
                "px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide",
                tab === "signup"
                  ? "bg-white/90 text-black font-bold"
                  : "text-white/80 hover:bg-white/10",
              )}
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setTab("signin");
                setStatus("idle");
                setMessage(null);
              }}
              className={cn(
                "px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide",
                tab === "signin"
                  ? "bg-white/90 text-black font-bold"
                  : "text-white/80 hover:bg-white/10",
              )}
            >
              Sign in
            </button>
          </div>
        </div>

        <h1 className="text-center text-xl md:text-2xl font-extrabold font-mono uppercase tracking-tight mb-4">
          {tab === "signup" ? "Create an account" : "Welcome back"}
        </h1>

        {tab === "signup" ? (
          <form onSubmit={signUp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                  First name
                </span>
                <input
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                  )}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                  Last name
                </span>
                <input
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                  )}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                Email
              </span>
              <input
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                  Password
                </span>
                <div className="relative">
                  <input
                    className={cn(
                      "w-full px-3.5 py-2.5 pr-9 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                    )}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white"
                  >
                    {showPwd ? (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              <label className="block space-y-2">
                <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                  Confirm
                </span>
                <div className="relative">
                  <input
                    className={cn(
                      "w-full px-3.5 py-2.5 pr-9 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                    )}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white"
                  >
                    {showConfirm ? (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className={cn(
                "w-full px-5 py-2.5 rounded-md border border-white/20 bg-primary text-black font-mono font-bold uppercase tracking-wide hover:translate-x-0.5 hover:translate-y-0.5",
              )}
            >
              Create an account
            </button>
          </form>
        ) : (
          <form onSubmit={signIn} className="space-y-4">
            <label className="block space-y-2">
              <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                Email
              </span>
              <input
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                )}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
              />
            </label>
            <label className="block space-y-2">
              <span className="block text-xs font-mono uppercase tracking-widest text-foreground/70">
                Password
              </span>
              <div className="relative">
                <input
                  className={cn(
                    "w-full px-3.5 py-2.5 pr-9 rounded-md border border-white/25 bg-black/30 text-white placeholder-white/60 font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:bg-black/40",
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showLoginPwd ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showLoginPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowLoginPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 hover:text-white"
                >
                  {showLoginPwd ? (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {/* Remember Me Checkbox */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-white/25 bg-black/30 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs font-mono text-white/70">
                Remember me on this device
              </span>
            </label>

            {/* Quick Login Button (shown when credentials are saved) */}
            {hasSavedCredentials && (
              <button
                type="button"
                onClick={signIn}
                className={cn(
                  "w-full px-5 py-2.5 rounded-md border border-white/25 bg-black/30 text-white font-mono font-bold uppercase tracking-wide hover:bg-black/40 hover:border-white/40 hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200",
                )}
              >
                ⚡ Quick Login
              </button>
            )}

            <button
              type="submit"
              className={cn(
                "w-full px-5 py-2.5 rounded-md border border-white/20 bg-primary text-black font-mono font-bold uppercase tracking-wide hover:translate-x-0.5 hover:translate-y-0.5",
              )}
            >
              Sign in
            </button>

            {/* Forget Credentials Button */}
            {hasSavedCredentials && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('savedLoginCredentials')
                  setEmail('')
                  setPassword('')
                  setRememberMe(false)
                  setHasSavedCredentials(false)
                  setMessage('Saved credentials removed')
                  setStatus('idle')
                  setTimeout(() => setMessage(null), 2000)
                }}
                className="w-full text-center font-mono text-xs text-red-400 hover:text-red-300 underline"
              >
                Forget saved credentials
              </button>
            )}
          </form>
        )}

        <div className="my-4">
          <div className="text-center mb-2">
            <span className="font-mono text-[11px] uppercase tracking-normal text-white/70">
              Or continue with
            </span>
          </div>
          <div className="w-full border-t border-white/15"></div>
        </div>

        <button
          onClick={() => signInWithProvider("google")}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-md border border-white/25 bg-black/30 font-mono uppercase tracking-wide text-white hover:bg-black/40 hover:border-white/40 inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10",
          )}
          type="button"
          aria-label="Continue with Google"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:rotate-12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4.5c1.98 0 3.77.73 5.17 1.94l-2.1 2.1A5.013 5.013 0 0 0 12 7c-2.28 0-4.21 1.5-4.9 3.53l-2.3-1.78C6.03 6.05 8.79 4.5 12 4.5Z"
              fill="#EA4335"
            />
            <path
              d="M4.8 8.75 7.1 10.53C6.9 11.17 6.9 11.84 7.1 12.47l-2.3 1.78A7.5 7.5 0 0 1 4.5 12c0-1.13.25-2.2.3-3.25Z"
              fill="#FBBC05"
            />
            <path
              d="M12 19.5c-3.21 0-5.97-1.55-7.2-3.75l2.3-1.78C7.79 15.5 9.72 17 12 17c1.4 0 2.67-.48 3.66-1.29l2.16 2.16C16.82 18.7 14.98 19.5 12 19.5Z"
              fill="#34A853"
            />
            <path
              d="M21 12c0-.66-.06-1.1-.18-1.6H12v3.2h5.04c-.24 1.2-.96 2.02-1.92 2.69l2.16 2.16C19.92 16.84 21 14.7 21 12Z"
              fill="#4285F4"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {message && (
          <div
            className={cn(
              "mt-6 border px-4 py-3 font-mono text-xs uppercase tracking-wide rounded-md",
              status === "success"
                ? "border-white/25 bg-green-500/10 text-green-400"
                : "border-red-500/40 bg-red-500/10 text-red-400",
            )}
          >
            {message}
          </div>
        )}

        <p className="mt-6 text-center font-mono text-[11px] text-white/60">
          By creating an account, you agree to our Terms & Service.
        </p>
      </div>
    </Modal>
  );
}
