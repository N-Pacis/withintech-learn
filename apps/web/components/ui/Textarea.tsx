import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        className={cn(
          'font-body text-sm w-full px-4 py-3 rounded-lg border bg-white text-[#0F0F0F]',
          'dark:bg-[#1a1a1a] dark:text-[#F9FAFB] dark:placeholder-[#6B7280]',
          'placeholder-[#9CA3AF] outline-none transition-all resize-none',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            : 'border-[#E5E7EB] focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10 dark:border-[#2d2d2d] dark:focus:border-[#7C3AED] dark:focus:ring-[#7C3AED]/10',
          className,
        )}
        {...props}
      />
      {error && <p className="font-body text-xs text-red-500">{error}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';

export { Textarea };
