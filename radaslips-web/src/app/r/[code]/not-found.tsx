import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold text-zinc-50">Slip not found</h1>
      <p className="mt-3 max-w-md text-zinc-400">
        This link may have expired or the slug is incorrect.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Back to RadaSlips
      </Link>
    </main>
  );
}
