'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { useCertificate } from '@/hooks/queries/courses';
import { PageLoader } from '@/components/ui';
import { Certificate } from '@/components/Certificate';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://learn.withintech.org';

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

  async function handleDownload() {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('cert-download-target');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`certificate-${cert!.courseSlug}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  const certData = {
    id: cert.id,
    completedAt: cert.completedAt,
    recipientName: cert.recipientName,
    courseTitle: cert.courseTitle,
    verifyUrl: `${APP_URL}/certificates/${userId}/${courseSlug}`,
    modules: cert.modules,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E8FF] via-[#FAF5FF] to-[#F3E8FF] flex flex-col items-center justify-center py-12 px-4">

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2.5 rounded-lg hover:bg-[#2A004A] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={15} />
          {downloading ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>

      {/* Certificate — fills container, shadow around it */}
      <div id="cert-download-target" className="w-full max-w-3xl shadow-2xl">
        <Certificate data={certData} />
      </div>

    </div>
  );
}
