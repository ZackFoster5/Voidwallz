"use client";

import Link from "next/link";
import { useState } from "react";
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

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Phone", link: "/phone" },
    { name: "Desktop", link: "/desktop" },
    { name: "Premium", link: "/premium" },
  ];

  return (
    <Navbar className="top-0">
      {/* Desktop */}
      <NavBody className="px-3 py-1">
        <div className="flex items-center gap-2">
          <NavbarLogo />
        </div>
        <NavItems items={navItems} />
        <div className="flex items-center gap-3">
          <Link
            href="/#signup"
            className="hidden md:inline-flex items-center rounded-full px-4 py-2 text-sm font-mono uppercase tracking-wide border-2 border-foreground bg-card text-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]"
          >
            SIGN UP
          </Link>
          <ThemeToggle />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item) => (
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
          <Link
            href="/#signup"
            className="w-full rounded-full px-4 py-3 text-center text-sm font-mono uppercase tracking-wide border-2 border-foreground bg-card text-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            SIGN UP
          </Link>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
