import { cn } from '@/lib/utils';

export interface Tab<T extends string = string> {
  label: string;
  value: T;
  count?: number;
}

interface TabsProps<T extends string = string> {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-[#E5E7EB]', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 font-body text-sm transition-colors',
              'focus:outline-none',
              active
                ? 'text-[#3D006B] font-medium'
                : 'text-[#6B7280] hover:text-[#0F0F0F]',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full font-body text-xs font-medium',
                active
                  ? 'bg-[#F3E8FF] text-[#3D006B]'
                  : 'bg-[#F3F4F6] text-[#6B7280]',
              )}>
                {tab.count}
              </span>
            )}
            {/* Active indicator */}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3D006B] rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
