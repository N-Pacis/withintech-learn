import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center mb-6">
        <span className="font-heading font-black text-2xl text-primary">
          404
        </span>
      </div>
      <h1 className="font-heading font-black text-2xl text-foreground mb-2">
        Page not found
      </h1>
      <p className="font-body text-sm text-muted max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-body text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
