import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-card/80 p-8 backdrop-blur">
        <h1 className="text-xl font-semibold">SIRAJ Admin</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Sign in to manage the website.</p>
        <LoginForm next={next ?? ""} />
      </div>
    </main>
  );
}
