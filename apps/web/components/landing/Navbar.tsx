"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo, ThemeToggle } from "@/components/ui";
import { cn } from "@/lib/utils";

function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "fr" | "rw">("en");

  return (
    <div
      className="flex items-center rounded-md border border-border bg-surface-subtle p-0.5"
      role="group"
      aria-label="Language selection"
    >
      <button
        onClick={() => setLang("en")}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded transition-colors",
          lang === "en"
            ? "bg-primary text-white"
            : "text-foreground hover:text-primary",
        )}
        aria-pressed={lang === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLang("fr")}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded transition-colors",
          lang === "fr"
            ? "bg-primary text-white"
            : "text-foreground hover:text-primary",
        )}
        aria-pressed={lang === "fr"}
        aria-label="Switch to French"
      >
        FR
      </button>
      <button
        onClick={() => setLang("rw")}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded transition-colors",
          lang === "rw"
            ? "bg-primary text-white"
            : "text-foreground hover:text-primary",
        )}
        aria-pressed={lang === "rw"}
        aria-label="Switch to Kinyarwanda"
      >
        RW
      </button>
    </div>
  );
}

const links = [
  { label: "Courses", href: "/courses" },
  { label: "Challenges", href: "/challenges" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface-shell border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo className="h-14" />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="font-heading text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Mobile: theme toggle (always visible) */}
        <div className="md:hidden">
          <ThemeToggle />
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-md text-foreground hover:bg-surface-muted transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-in-out border-t border-border",
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-6 py-4 flex flex-col gap-1 bg-surface-shell">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-heading text-sm font-semibold text-foreground hover:text-primary transition-colors py-2.5 border-b border-border-subtle last:border-0"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
