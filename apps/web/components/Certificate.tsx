'use client';

import { useRef, useEffect, useState, CSSProperties } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export interface CertData {
  id: string;
  completedAt: string;
  recipientName: string;
  courseTitle: string;
  verifyUrl: string;
  modules?: string[];
}

// Natural design width. All em values are relative to this.
const NATURAL_WIDTH = 768;
const BASE_FONT = 16; // px at natural width

function em(px: number): string {
  return `${px / BASE_FONT}em`;
}

function Ornament({ style }: { style: CSSProperties }) {
  return (
    <svg
      style={{ position: 'absolute', width: em(28), height: em(28), ...style }}
      viewBox="0 0 28 28"
      fill="#3D006B"
    >
      <path d="M2 2 L12 2 L12 6 L6 6 L6 12 L2 12 Z" />
      <rect x="2" y="2" width="4" height="4" />
    </svg>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: em(12), width: '100%' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C084FC)' }} />
      <svg style={{ width: em(16), height: em(16) }} viewBox="0 0 16 16" fill="#C084FC">
        <path d="M8 0 L9.5 6 L16 8 L9.5 10 L8 16 L6.5 10 L0 8 L6.5 6 Z" />
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C084FC)' }} />
    </div>
  );
}

interface CertificateProps {
  data: CertData;
  /** Element id — needed by the PDF download handler to find the DOM node */
  domId?: string;
}

export function Certificate({ data, domId }: CertificateProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(BASE_FONT);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setFontSize((w / NATURAL_WIDTH) * BASE_FONT);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const date = new Date(data.completedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const qrSize = Math.round(fontSize * (72 / BASE_FONT));
  const modules = data.modules ?? [];

  return (
    <div
      ref={wrapRef}
      id={domId}
      style={{
        fontSize,
        width: '100%',
        position: 'relative',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer border */}
      <div style={{
        position: 'absolute', inset: 0,
        border: `${em(12)} solid #3D006B`,
        pointerEvents: 'none', zIndex: 1,
      }} />
      {/* Inner border */}
      <div style={{
        position: 'absolute', inset: em(16),
        border: `${em(3)} solid #C084FC`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Corner ornaments */}
      <Ornament style={{ top: em(12), left: em(12) }} />
      <Ornament style={{ top: em(12), right: em(12), transform: 'rotate(90deg)' }} />
      <Ornament style={{ bottom: em(12), left: em(12), transform: 'rotate(-90deg)' }} />
      <Ornament style={{ bottom: em(12), right: em(12), transform: 'rotate(180deg)' }} />

      {/* Content */}
      <div style={{
        padding: `${em(48)} ${em(64)}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 0,
      }}>

        {/* Logo */}
        <div style={{ marginBottom: em(12) }}>
          <Image
            src="/logo.png"
            alt="WithinTech Learn"
            width={200}
            height={200}
            style={{ height: em(56), width: 'auto' }}
            unoptimized
          />
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontWeight: 700,
          color: '#3D006B',
          fontSize: em(12),
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: em(24),
          textAlign: 'center',
        }}>
          WithinTech Learn — Official Certificate
        </p>

        <Divider />

        {/* Main title */}
        <h1 style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontWeight: 900,
          fontSize: em(36),
          color: '#1F0A3C',
          textAlign: 'center',
          letterSpacing: '0.04em',
          marginTop: em(24),
          marginBottom: em(8),
        }}>
          Certificate of Completion
        </h1>

        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          color: '#6B7280',
          fontSize: em(14),
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: em(24),
        }}>
          This is to certify that
        </p>

        {/* Recipient name */}
        <p style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontWeight: 800,
          fontSize: em(40),
          color: '#3D006B',
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          marginBottom: em(8),
        }}>
          {data.recipientName}
        </p>
        <div style={{ width: em(256), height: '1px', backgroundColor: '#C084FC', marginBottom: em(24) }} />

        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: em(14),
          color: '#6B7280',
          letterSpacing: '0.05em',
          textAlign: 'center',
          marginBottom: em(12),
        }}>
          has successfully completed the course
        </p>

        {/* Course title */}
        <h2 style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontWeight: 900,
          fontSize: em(24),
          color: '#1F0A3C',
          textAlign: 'center',
          marginBottom: em(4),
        }}>
          {data.courseTitle}
        </h2>

        {/* Date */}
        <p style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: em(14),
          color: '#9CA3AF',
          marginBottom: em(32),
        }}>
          Completed on{' '}
          <span style={{ color: '#374151', fontWeight: 600 }}>{date}</span>
        </p>

        {/* Modules */}
        {modules.length > 0 && (
          <div data-pdf-modules style={{ width: '100%', marginBottom: em(32) }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: em(12),
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textAlign: 'center',
              marginBottom: em(16),
            }}>
              Covering the following modules
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: em(8) }}>
              {Array.from({ length: Math.ceil(modules.length / 3) }, (_, rowIdx) => (
                <div key={rowIdx} style={{ display: 'flex', gap: em(10) }}>
                  {modules.slice(rowIdx * 3, rowIdx * 3 + 3).map((m, j) => {
                    const i = rowIdx * 3 + j;
                    return (
                      <div key={i} style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: em(6),
                        padding: `${em(6)} ${em(10)}`,
                        backgroundColor: '#F5F3FF',
                        borderRadius: em(6),
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-syne), sans-serif',
                          fontWeight: 700,
                          fontSize: em(11),
                          color: '#7C3AED',
                          flexShrink: 0,
                          lineHeight: 1.5,
                        }}>
                          {i + 1}.
                        </span>
                        <span data-pdf-module-title style={{
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          fontSize: em(11),
                          color: '#1F0A3C',
                          lineHeight: 1.5,
                        }}>
                          {m}
                        </span>
                      </div>
                    );
                  })}
                  {modules.slice(rowIdx * 3, rowIdx * 3 + 3).length < 3 &&
                    Array.from({ length: 3 - modules.slice(rowIdx * 3, rowIdx * 3 + 3).length }, (_, k) => (
                      <div key={`empty-${k}`} style={{ flex: 1 }} />
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider />

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: em(24),
          gap: em(24),
        }}>

          {/* Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: em(4) }}>
            <Image
              src="/signature.png"
              alt="Signature"
              width={220}
              height={88}
              style={{ height: em(72), width: 'auto', objectFit: 'contain' }}
              unoptimized
            />
            <div style={{ width: em(200), height: '1px', backgroundColor: '#C084FC' }} />
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontWeight: 700,
              fontSize: em(11),
              color: '#1F0A3C',
              textAlign: 'center',
              marginTop: em(4),
              lineHeight: 1.4,
            }}>
              Niyomungeli Aline
            </p>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: em(10),
              color: '#6B7280',
              textAlign: 'center',
              letterSpacing: '0.05em',
            }}>
              CEO, WithinTech Rwanda
            </p>
          </div>

          {/* Certificate ID + site */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: em(10),
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: em(4),
            }}>
              Certificate ID
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: em(11),
              color: '#6B7280',
              wordBreak: 'break-all',
            }}>
              {data.id}
            </p>
            <div style={{ marginTop: em(12), width: em(128), height: '1px', backgroundColor: '#E5E7EB', margin: `${em(12)} auto 0` }} />
            <p style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontWeight: 700,
              fontSize: em(11),
              color: '#3D006B',
              marginTop: em(8),
              letterSpacing: '0.05em',
            }}>
              learn.withintech.org
            </p>
          </div>

          {/* QR code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: em(8) }}>
            <div style={{
              padding: em(8),
              border: `1px solid #E5E7EB`,
              borderRadius: em(8),
            }}>
              <QRCodeSVG
                value={data.verifyUrl}
                size={qrSize}
                bgColor="#ffffff"
                fgColor="#3D006B"
                level="M"
              />
            </div>
            <p style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: em(10),
              color: '#9CA3AF',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              Verify online
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
