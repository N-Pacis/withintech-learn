'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { useCertificate } from '@/hooks/queries/courses';
import { PageLoader } from '@/components/ui';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CertificatePage() {
  const { userId, courseSlug } = useParams<{ userId: string; courseSlug: string }>();
  const { data: cert, isLoading, isError } = useCertificate(userId, courseSlug);
  const [downloading, setDownloading] = useState(false);

  if (isLoading) return <PageLoader type="content" />;
  if (isError || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <p className="font-body text-sm text-red-500">Certificate not found.</p>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://learn.withintech.org';

  async function handleDownload() {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('certificate');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`certificate-${cert!.courseSlug}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E8FF] via-[#FAF5FF] to-[#F3E8FF] flex flex-col items-center justify-center py-12 px-4">

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2.5 rounded-lg hover:bg-[#2A004A] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={15} /> {downloading ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="relative bg-white w-full max-w-3xl shadow-2xl"
      >
        {/* Outer decorative border */}
        <div className="absolute inset-0 border-[12px] border-[#3D006B] pointer-events-none" />
        <div className="absolute inset-[16px] border-[3px] border-[#C084FC] pointer-events-none" />

        {/* Corner ornaments */}
        <Ornament className="top-3 left-3" />
        <Ornament className="top-3 right-3 rotate-90" />
        <Ornament className="bottom-3 left-3 -rotate-90" />
        <Ornament className="bottom-3 right-3 rotate-180" />

        <div className="px-16 py-12 flex flex-col items-center">

          {/* Logo */}
          <div className="mb-3">
            <Image src="/logo.png" alt="WithinTech Learn" width={200} height={200} className="h-14 w-auto" unoptimized />
          </div>

          {/* Subtitle — using our heading font */}
          <p className="font-heading font-bold text-[#3D006B] text-xs tracking-[0.3em] uppercase mb-6">
            WithinTech Learn — Official Certificate
          </p>

          <DividerLine />

          {/* Main title */}
          <h1 className="font-heading font-black text-4xl text-[#1F0A3C] text-center mt-6 mb-2" style={{ letterSpacing: '0.04em' }}>
            Certificate of Completion
          </h1>

          <p className="font-body text-[#6B7280] text-sm tracking-widest uppercase mb-6">This is to certify that</p>

          {/* Recipient name */}
          <p className="text-[#3D006B] text-center mb-2" style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '3rem', lineHeight: 1.2 }}>
            {cert.recipientName}
          </p>
          <div className="w-64 h-px bg-[#C084FC] mb-6" />

          <p className="font-body text-sm text-[#6B7280] tracking-wide text-center mb-3">
            has successfully completed the course
          </p>

          {/* Course title */}
          <h2 className="font-heading font-black text-2xl text-[#1F0A3C] text-center mb-1">
            {cert.courseTitle}
          </h2>

          {/* Date */}
          <p className="font-body text-sm text-[#9CA3AF] mb-8">
            Completed on <span className="text-[#374151] font-semibold">{formatDate(cert.completedAt)}</span>
          </p>

          {/* Modules */}
          {cert.modules.length > 0 && (
            <div className="w-full mb-8">
              <p className="font-body text-xs text-[#9CA3AF] uppercase tracking-widest text-center mb-4">
                Covering the following modules
              </p>
              <div className={cert.modules.length > 3 ? 'grid grid-cols-2 gap-x-8 gap-y-2' : 'flex flex-col gap-2 max-w-sm mx-auto'}>
                {cert.modules.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#3D006B] flex items-center justify-center shrink-0">
                      <span className="font-heading font-bold text-[9px] text-white leading-none">{i + 1}</span>
                    </span>
                    <span className="font-body text-xs text-[#374151] leading-snug">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DividerLine />

          {/* Footer: seal + info + QR */}
          <div className="flex items-end justify-between w-full mt-6 gap-6">

            {/* Seal */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-4 border-[#3D006B] flex items-center justify-center bg-[#F3E8FF] relative">
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#C084FC]" />
                <p className="font-heading font-black text-[9px] text-[#3D006B] tracking-tight uppercase text-center leading-tight z-10">
                  CERT<br />IFIED
                </p>
              </div>
              <p className="font-body text-[10px] text-[#9CA3AF] tracking-widest uppercase">Official Seal</p>
            </div>

            {/* Certificate ID + site */}
            <div className="text-center flex-1">
              <p className="font-body text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-1">Certificate ID</p>
              <p className="font-body text-xs text-[#6B7280] font-mono break-all">{cert.id}</p>
              <div className="mt-3 w-32 h-px bg-[#E5E7EB] mx-auto" />
              <p className="font-heading font-bold text-[11px] text-[#3D006B] mt-2 tracking-wide">
                learn.withintech.org
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <div className="p-2 border border-[#E5E7EB] rounded-lg">
                <QRCodeSVG value={appUrl} size={72} bgColor="#ffffff" fgColor="#3D006B" level="M" />
              </div>
              <p className="font-body text-[10px] text-[#9CA3AF] tracking-widest uppercase">Verify online</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function Ornament({ className }: { className: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="#3D006B" className={`absolute ${className}`}>
      <path d="M2 2 L12 2 L12 6 L6 6 L6 12 L2 12 Z" />
      <rect x="2" y="2" width="4" height="4" />
    </svg>
  );
}

function DividerLine() {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C084FC]" />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="#C084FC">
        <path d="M8 0 L9.5 6 L16 8 L9.5 10 L8 16 L6.5 10 L0 8 L6.5 6 Z" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C084FC]" />
    </div>
  );
}
