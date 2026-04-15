import { ReactNode, LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
  labelProps,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="font-body text-sm font-medium text-[#0F0F0F] dark:text-[#F9FAFB]"
        {...labelProps}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className="font-body text-xs text-[#9CA3AF] dark:text-[#6B7280]">{hint}</p>
      )}
      {error && (
        <p className="font-body text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
