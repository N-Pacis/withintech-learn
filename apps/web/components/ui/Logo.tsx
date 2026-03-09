import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Wrap the logo in a link to "/" (default: true) */
  linked?: boolean;
}

export default function Logo({ className, linked = true }: LogoProps) {
  const img = (
    <Image
      src="/logo.svg"
      alt="WithinTech Learn"
      width={1500}
      height={1500}
      className={cn('w-auto', className ?? 'h-20')}
      priority
    />
  );

  if (!linked) return img;

  return (
    <Link href="/" className="shrink-0 inline-block">
      {img}
    </Link>
  );
}
