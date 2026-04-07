'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useStudentCertificates, StudentCertificateSummary } from '@/hooks/queries/courses';
import { useProfile } from '@/hooks/queries/auth';
import { PageLoader } from '@/components/ui';
import { Certificate } from '@/components/Certificate';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://learn.withintech.org';

function certUrl(userId: string, courseSlug: string) {
  return `${APP_URL}/certificates/${userId}/${courseSlug}`;
}

// ─── Share popover — fixed-positioned to never be clipped ────────────────────

interface SharePopoverProps {
  cert: StudentCertificateSummary;
  userId: string;
  rect: DOMRect;
  onClose: () => void;
}

function SharePopover({ cert, userId, rect, onClose }: SharePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const url = certUrl(userId, cert.courseSlug);
  const year = new Date(cert.completedAt).getFullYear();
  const month = new Date(cert.completedAt).getMonth() + 1;

  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    const id = setTimeout(() => document.addEventListener('pointerdown', onDown), 0);
    return () => { clearTimeout(id); document.removeEventListener('pointerdown', onDown); };
  }, [onClose]);

  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow > 240 ? rect.bottom + 8 : rect.top - 8;
  const translateY = spaceBelow > 240 ? '0%' : '-100%';

  const links = [
    {
      label: 'LinkedIn',
      sublabel: 'Add to profile',
      href: `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.courseTitle)}&organizationName=WithinTech+Learn&issueYear=${year}&issueMonth=${month}&certUrl=${encodeURIComponent(url)}&certId=${encodeURIComponent(cert.id)}`,
      icon: <FaLinkedin size={18} color="#0A66C2" />,
      bg: '#EEF4FB',
    },
    {
      label: 'WhatsApp',
      sublabel: 'Share with contacts',
      href: `https://wa.me/?text=${encodeURIComponent(`🎓 I just completed "${cert.courseTitle}" on WithinTech Learn!\n\nView my certificate: ${url}`)}`,
      icon: <FaWhatsapp size={18} color="#25D366" />,
      bg: '#EDFBF2',
    },
    {
      label: 'X (Twitter)',
      sublabel: 'Post to your timeline',
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(`🎓 Just completed "${cert.courseTitle}" on @WithinTechLearn!\n\n`)}&url=${encodeURIComponent(url)}`,
      icon: <FaXTwitter size={18} color="#000000" />,
      bg: '#F3F4F6',
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed z-9999 w-64 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-3"
      style={{ top, right: window.innerWidth - rect.right, transform: `translateY(${translateY})` }}
    >
      <p className="font-body text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider px-4 mb-2">
        Share Certificate
      </p>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9FAFB] transition-colors"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: l.bg }}>
            {l.icon}
          </div>
          <div>
            <p className="font-body text-sm font-medium text-[#0F0F0F] leading-tight">{l.label}</p>
            <p className="font-body text-xs text-[#9CA3AF]">{l.sublabel}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── Certificate card ─────────────────────────────────────────────────────────

interface ActiveShare { cert: StudentCertificateSummary; rect: DOMRect }

function CertificateCard({
  cert,
  userId,
  onShare,
}: {
  cert: StudentCertificateSummary;
  userId: string;
  onShare: (cert: StudentCertificateSummary, rect: DOMRect) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const certData = {
    id: cert.id,
    completedAt: cert.completedAt,
    recipientName: cert.recipientName,
    courseTitle: cert.courseTitle,
    verifyUrl: certUrl(userId, cert.courseSlug),
    // no modules in list view — certificate still renders correctly without them
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#D1D5DB] transition-all flex flex-col">

      {/* Preview: click opens full certificate */}
      <Link
        href={certUrl(userId, cert.courseSlug)}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-t-2xl overflow-hidden h-44 block select-none cursor-pointer"
      >
        <Certificate data={certData} />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading font-bold text-sm text-[#0F0F0F] leading-snug line-clamp-2">
            {cert.courseTitle}
          </h3>
          <span className="shrink-0 text-[10px] font-body font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
            Earned
          </span>
        </div>
        <p className="font-body text-xs text-[#9CA3AF] mb-4">
          {new Date(cert.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="flex gap-2 mt-auto">
          <Link
            href={`/learn/courses/${cert.courseSlug}`}
            className="flex-1 flex items-center justify-center gap-1.5 font-body text-sm font-medium text-[#3D006B] bg-[#F3E8FF] hover:bg-[#EDE9FE] px-3 py-2 rounded-lg transition-colors"
          >
            Go to Course
          </Link>

          <button
            ref={btnRef}
            onClick={() => btnRef.current && onShare(cert, btnRef.current.getBoundingClientRect())}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#374151] transition-colors"
            aria-label="Share certificate"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const { data: certs, isLoading, isError } = useStudentCertificates();
  const { data: profile } = useProfile();
  const [activeShare, setActiveShare] = useState<ActiveShare | null>(null);

  const openShare = useCallback((cert: StudentCertificateSummary, rect: DOMRect) => {
    setActiveShare((prev) => prev?.cert.id === cert.id ? null : { cert, rect });
  }, []);

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto w-full">

      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-[#0F0F0F]">My Certificates</h1>
        <p className="font-body text-sm text-[#6B7280] mt-1">
          Certificates you have earned by completing courses.
        </p>
      </div>

      {isLoading && <PageLoader type="cards" count={6} />}

      {isError && (
        <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          Failed to load certificates. Please refresh.
        </p>
      )}

      {!isLoading && !isError && certs?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3D006B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-lg text-[#0F0F0F] mb-2">No certificates yet</h3>
          <p className="font-body text-sm text-[#6B7280] max-w-xs">
            Complete all modules and pass the final quiz to earn your first certificate.
          </p>
        </div>
      )}

      {certs && certs.length > 0 && profile && (
        <>
          <p className="font-body text-sm text-[#9CA3AF] mb-6">
            {certs.length} certificate{certs.length !== 1 ? 's' : ''} earned
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {certs.map((cert) => (
              <CertificateCard
                key={cert.id}
                cert={cert}
                userId={profile.id}
                onShare={openShare}
              />
            ))}
          </div>
        </>
      )}

      {activeShare && profile && (
        <SharePopover
          cert={activeShare.cert}
          userId={profile.id}
          rect={activeShare.rect}
          onClose={() => setActiveShare(null)}
        />
      )}

    </div>
  );
}
