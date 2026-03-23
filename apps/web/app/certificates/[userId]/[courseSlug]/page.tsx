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
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (_doc, el) => {
          el.style.boxShadow = 'none';

          const moduleSection = el.querySelector('[data-pdf-modules]') as HTMLElement | null;
          if (moduleSection) {
            const titles = Array.from(
              moduleSection.querySelectorAll('[data-pdf-module-title]'),
            ).map((n) => n.textContent ?? '');

            const cols = titles.length > 3 ? 2 : 1;
            moduleSection.innerHTML = `
              <p style="
                font-family: var(--font-syne), sans-serif;
                font-weight: 700;
                font-size: 10px;
                color: #9CA3AF;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                text-align: center;
                margin: 0 0 14px;
              ">Covering the following modules</p>
              <ol style="
                list-style: none;
                margin: 0 auto;
                padding: 0;
                max-width: ${cols > 1 ? '100%' : '420px'};
                column-count: ${cols};
                column-gap: 40px;
                column-rule: 1px solid #E9D5FF;
              ">
                ${titles.map((t, i) => `
                  <li style="
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 6px;
                    break-inside: avoid;
                  ">
                    <span style="
                      font-family: var(--font-syne), sans-serif;
                      font-weight: 700;
                      font-size: 12px;
                      color: #7C3AED;
                      min-width: 20px;
                      text-align: right;
                      flex-shrink: 0;
                      line-height: 1.6;
                    ">${i + 1}.</span>
                    <span style="
                      font-family: var(--font-dm-sans), sans-serif;
                      font-size: 12px;
                      color: #1F0A3C;
                      line-height: 1.6;
                    ">${t}</span>
                  </li>
                `).join('')}
              </ol>
            `;
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Size the PDF to exactly match the element's CSS dimensions.
      // 1 CSS pixel = 25.4 / 96 mm at 96 DPI.
      const PX_TO_MM = 25.4 / 96;
      const pdfW = element.offsetWidth * PX_TO_MM;
      const pdfH = element.offsetHeight * PX_TO_MM;

      const pdf = new jsPDF({
        orientation: pdfW > pdfH ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfW, pdfH],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
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
