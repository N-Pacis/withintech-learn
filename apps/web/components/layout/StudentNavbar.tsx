"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, ThemeToggle } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "My Courses", href: "/learn" },
  { label: "Challenges", href: "/learn/challenges" },
  { label: "Certificates", href: "/learn/certificates" },
];

export default function StudentNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-surface-shell border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 py-1">
          <Logo className="h-14" linked={false} />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 font-body text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                pathname === href ||
                  (href !== "/learn" && pathname.startsWith(href))
                  ? "text-primary bg-primary/5"
                  : "text-muted hover:text-primary hover:bg-primary/5",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: theme toggle + user + logout */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-heading font-bold text-xs text-primary">
                {user?.firstName?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <span className="font-body text-sm text-foreground-soft">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <button
            onClick={logout}
            className="font-body text-sm text-muted hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              width="18"
              height="18"
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
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-surface-shell px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "inline-flex items-center gap-1.5 font-body text-sm font-medium px-3 py-2.5 rounded-lg transition-colors",
                pathname === href ||
                  (href !== "/learn" && pathname.startsWith(href))
                  ? "text-primary bg-primary/5"
                  : "text-muted hover:text-primary hover:bg-primary/5",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
