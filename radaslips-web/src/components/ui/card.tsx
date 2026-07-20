import { ReactNode } from 'react';

export function Card({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl shadow-black/20 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
