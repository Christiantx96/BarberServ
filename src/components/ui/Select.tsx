import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from './Button';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-xs font-medium text-amber-100/70">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-white/10 bg-[#14100a] px-3 py-1 text-sm text-amber-50 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/50 focus-visible:ring-red-500",
            className
          )}
          {...props}
        >
          <option value="" disabled>Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
