export default function CertificateCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-md shadow-2xl p-8 w-full max-w-md mx-auto lg:mx-0">
      <div className="border border-[#3D006B]/20 rounded p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className="font-body text-[10px] tracking-widest uppercase text-[#6B7280] dark:text-[#9CA3AF] mb-2">
              WithinTech Learn · Rwanda
            </p>
            <h3 className="font-heading font-bold text-lg text-[#0F0F0F] dark:text-[#F9FAFB] leading-snug">
              Certificate of Completion
            </h3>
          </div>
          {/* Orange seal */}
          <div className="w-12 h-12 rounded-full bg-[#F97316] flex items-center justify-center flex-shrink-0 ml-4">
            <span className="font-heading font-black text-white text-sm leading-none">
              WT
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E7EB] dark:border-[#2d2d2d] mb-6" />

        {/* Student */}
        <p className="font-body text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-widest mb-1">
          Awarded to
        </p>
        <p className="font-heading font-bold text-xl text-[#0F0F0F] dark:text-[#F9FAFB] mb-5">
          Uwimana Clarisse
        </p>

        {/* Course */}
        <p className="font-body text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-widest mb-1">
          For successfully completing
        </p>
        <p className="font-heading font-semibold text-[#3D006B] text-base mb-7">
          Introduction to Digital Skills
        </p>

        {/* Footer row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-body text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-widest mb-1">
              Date issued
            </p>
            <p className="font-body text-sm text-[#0F0F0F] dark:text-[#F9FAFB]">March 2025</p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
              WithinTech Rwanda
            </p>
            <div className="mt-1 w-20 border-t border-[#0F0F0F]/20 dark:border-[#F9FAFB]/20 ml-auto" />
            <p className="font-body text-[10px] text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Authorised signature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
