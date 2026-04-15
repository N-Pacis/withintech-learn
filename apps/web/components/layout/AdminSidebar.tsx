"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutGrid,
  Shield,
  Users,
  ClipboardCheck,
  Zap,
  X,
  LogOut,
} from "lucide-react";
import { Logo, ThemeToggle } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    exact: true,
    icon: <LayoutGrid size={16} />,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    exact: false,
    icon: <BookOpen size={16} />,
  },
  {
    label: "Challenges",
    href: "/admin/challenges",
    exact: false,
    icon: <Zap size={16} />,
  },
  {
    label: "Admins",
    href: "/admin/admins",
    exact: false,
    icon: <Shield size={16} />,
  },
  {
    label: "Students",
    href: "/admin/students",
    exact: false,
    icon: <Users size={16} />,
  },
  {
    label: "Enrollments",
    href: "/admin/enrollments",
    exact: false,
    icon: <ClipboardCheck size={16} />,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen bg-surface-shell flex flex-col",
          "border-r border-border-faint shadow-sm",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:sticky lg:top-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between">
          <Logo className="h-12" linked={false} variant="default" />
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-muted-contrast hover:text-foreground-soft hover:bg-surface-muted transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          <p className="font-body text-[10px] font-semibold text-muted-contrast tracking-widest uppercase px-3 mb-2">
            Menu
          </p>
          {navItems.map(({ label, href, exact, icon }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-surface-subtle",
                )}
              >
                <span
                  className={cn(
                    "shrink-0",
                    active ? "text-white" : "text-muted-contrast",
                  )}
                >
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-border-faint">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="font-heading font-bold text-xs text-white">
                {initials || "?"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-medium text-foreground truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="font-body text-xs text-muted-contrast truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 mb-1">
            <span className="font-body text-xs text-muted-contrast">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors font-body text-sm"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
