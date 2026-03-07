import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-0">
          <span className="font-heading font-bold text-xl text-[#3D006B]">
            WithinTech
          </span>
          <span className="font-heading font-bold text-xl text-[#F97316]">
            Learn
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#courses"
            className="font-heading text-sm font-semibold text-[#0F0F0F] hover:text-[#3D006B] transition-colors"
          >
            Courses
          </Link>
          <Link
            href="#how-it-works"
            className="font-heading text-sm font-semibold text-[#0F0F0F] hover:text-[#3D006B] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/sign-in"
            className="font-body text-sm font-medium bg-[#3D006B] text-white px-5 py-2 rounded-md hover:bg-[#2A004A] transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="md:hidden">
          <Link
            href="/sign-in"
            className="font-body text-sm font-medium bg-[#3D006B] text-white px-4 py-2 rounded-md hover:bg-[#2A004A] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
