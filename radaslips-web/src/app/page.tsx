import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-16 lg:py-24">
        <header className="flex items-center justify-between">
          <p className="text-lg font-semibold text-emerald-400">RadaSlips</p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:text-white"
            >
              Sign in
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </header>

        <section className="mt-20 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Dark social slip links
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
            Turn WhatsApp slips into trackable, compliant slip links.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            RadaSlips wraps bookmaker booking codes into shareable slip links
            with built-in compliance gates, click tracking, and tipster
            commission wallets.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register">
              <Button>Create tipster account</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Open dashboard</Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          <Feature
            title="Trackable slip links"
            body="Every booking code gets a unique slug like /r/fly-kamau so you know exactly who drove the traffic."
          />
          <Feature
            title="Compliance built in"
            body="Age gates, responsible gaming warnings, and BCLB license details appear before every redirect."
          />
          <Feature
            title="Earn on clicks"
            body="Commissions credit automatically to tipster wallets when users accept the gateway and continue."
          />
        </section>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
    </article>
  );
}
