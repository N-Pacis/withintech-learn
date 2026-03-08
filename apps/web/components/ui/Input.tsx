import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={cn(
          'font-body text-sm w-full px-4 py-3 rounded-lg border bg-white text-[#0F0F0F]',
          'placeholder-[#9CA3AF] outline-none transition-all',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10'
            : 'border-[#E5E7EB] focus:border-[#3D006B] focus:ring-2 focus:ring-[#3D006B]/10',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="font-body text-xs text-red-500">{error}</p>
      )}
    </div>
  ),
);

Input.displayName = 'Input';

export { Input };
