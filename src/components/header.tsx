"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { supabase } from "@/lib/supabase-client";
import SignupModal from "@/components/auth/signup-modal";
import { Icon } from "@/components/ui/icon";

export default function Header({
  initialIsAuthed = false,
  initialName = null,
}: {
  initialIsAuthed?: boolean;
  initialName?: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthed, setIsAuthed] = useState(initialIsAuthed);
  const [initialized, setInitialized] = useState(false);

  // Prime UI from localStorage to further reduce flicker
  useEffect(() => {
    try {
      const cached = localStorage.getItem("VW_AUTHED");
      if (cached === "1") {
        setIsAuthed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const u = session?.user;
      if (!cancelled) {
        setIsAuthed(!!u);
        setInitialized(true);
      }
    }
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
      try {
        localStorage.setItem("VW_AUTHED", session ? "1" : "0");
      } catch {}
      setInitialized(true);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loggedOutNav = [
    { name: "Home", link: "/" },
  ];
  const loggedInNav = [
    { name: "Phone", link: "/phone" },
    { name: "Desktop", link: "/desktop" },
    { name: "Premium", link: "/premium" },
  ];
  const navItems = !initialized ? [] : isAuthed ? loggedInNav : loggedOutNav;

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Navbar className="top-0">
      {/* Desktop */}
      <NavBody className="px-3 py-1">
        <div className="flex items-center gap-2">
          <NavbarLogo />
        </div>
        {initialized && <NavItems items={navItems} />}
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Link
                href="/profile"
                aria-label="Profile"
                className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-foreground bg-card text-foreground hover:bg-primary hover:text-background"
              >
                <Icon name="user" className="w-4 h-4" />
              </Link>
              <button
                onClick={signOut}
                aria-label="Logout"
                className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-foreground bg-card text-foreground hover:bg-primary hover:text-background"
              >
                <Icon name="logout" className="w-4 h-4" />
              </button>
            </>
          ) : (
            initialized && (
              <button
                onClick={() => setShowSignup(true)}
                className="hidden md:inline-flex items-center rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-wide border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0px_0px_var(--color-foreground)] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)] relative z-20"
              >
                Sign in / Sign up
              </button>
            )
          )}
          <ThemeToggle className="hidden md:inline-flex" />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <div className="flex items-center gap-3">
            <NavbarLogo />
            {/* Theme toggle moved into dropdown menu on mobile */}
          </div>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {/* Show theme toggle inside menu as well for easy access */}
          <div className="py-2">
            <ThemeToggle className="mx-auto" />
          </div>
          {initialized &&
            navItems.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-foreground"
              >
                <span className="block font-mono uppercase tracking-wide">
                  {item.name}
                </span>
              </Link>
            ))}
          {isAuthed ? (
            <div className="flex w-full gap-2">
              <Link
                href="/profile"
                className="flex-1 rounded-full px-4 py-3 text-center text-sm font-mono uppercase tracking-wide border-2 border-foreground bg-card text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}
                className="flex-1 rounded-full px-4 py-3 text-center text-sm font-mono uppercase tracking-wide border-2 border-foreground bg-card text-foreground"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowSignup(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full rounded-full px-4 py-3 text-center text-sm font-mono uppercase tracking-wide border-2 border-foreground bg-card text-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]"
            >
              Sign in / Sign up
            </button>
          )}
        </MobileNavMenu>
      </MobileNav>

      {/* Auth modal */}
      <SignupModal open={showSignup} onClose={() => setShowSignup(false)} />
    </Navbar>
  );
}
