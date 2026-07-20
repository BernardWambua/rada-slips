import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={inputId} className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 ${className}`}
        {...props}
      />
      {hint ? <span className="block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
