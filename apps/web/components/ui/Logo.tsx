import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_NAME, LOGO_SIZE } from "@/lib/brand";

interface LogoProps {
  className?: string;
  /** Wrap the logo in a link to "/" (default: true) */
  linked?: boolean;
  /** Use 'sidebar' to show the sidebar-specific logo */
  variant?: "default" | "sidebar";
}

export default function Logo({ className, linked = true }: LogoProps) {
  const img = (
    <>
      <Image
        src="/logo.png"
        alt={BRAND_NAME}
        width={LOGO_SIZE.width}
        height={LOGO_SIZE.height}
        className={cn("w-auto dark:hidden", className ?? "h-16")}
        priority
        unoptimized
      />
      <Image
        src="/logo-dark-mode.png"
        alt={BRAND_NAME}
        width={LOGO_SIZE.width}
        height={LOGO_SIZE.height}
        className={cn("w-auto hidden dark:block", className ?? "h-16")}
        priority
        unoptimized
      />
    </>
  );

  if (!linked) return img;

  return (
    <Link href="/" className="shrink-0 inline-block">
      {img}
    </Link>
  );
}
