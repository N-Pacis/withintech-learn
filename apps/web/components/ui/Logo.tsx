import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Wrap the logo in a link to "/" (default: true) */
  linked?: boolean;
  /** Use 'sidebar' to show the sidebar-specific logo */
  variant?: 'default' | 'sidebar';
}

export default function Logo({ className, linked = true }: LogoProps) {
  const img = (
    <>
      <Image
        src="/logo.png"
        alt="WithinTech Learn"
        width={1000}
        height={1000}
        className={cn('w-auto dark:hidden', className ?? 'h-20')}
        priority
        unoptimized
      />
      <Image
        src="/logo-dark-mode.png"
        alt="WithinTech Learn"
        width={1000}
        height={1000}
        className={cn('w-auto hidden dark:block', className ?? 'h-20')}
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
