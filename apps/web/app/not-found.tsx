import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] flex items-center justify-center mb-6">
        <span className="font-heading font-black text-2xl text-[#3D006B]">404</span>
      </div>
      <h1 className="font-heading font-black text-2xl text-[#0F0F0F] mb-2">Page not found</h1>
      <p className="font-body text-sm text-[#6B7280] max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2.5 rounded-lg hover:bg-[#2A004A] transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
