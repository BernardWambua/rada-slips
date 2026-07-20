import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-900/40',
    secondary:
      'border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500',
    ghost: 'text-zinc-300 hover:bg-zinc-900',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
