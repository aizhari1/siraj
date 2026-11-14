import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { metaAppConfigured } from "@/lib/social/meta";
import { btnGhost, btnPrimary, btnDanger } from "@/lib/admin/ui";
import { disconnectSocial, startMetaConnect } from "./actions";

type Conn = {
  id: string;
  platform: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  token_expires_at: string | null;
};

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const configured = metaAppConfigured();

  const { data, error } = await supabase
    .from("social_connections")
    .select("id,platform,name,username,avatar_url,is_active,last_synced_at,token_expires_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Conn[];
  const fb = rows.filter((r) => r.platform === "facebook_page");
  const ig = rows.filter((r) => r.platform === "instagram_business");

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Social</h1>
        <p className="mt-1 text-sm text-muted">
          Facebook &amp; Instagram in one place. Accounts connect via official Meta login — passwords are never stored here.
        </p>
      </div>

      {sp.error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {decodeURIComponent(sp.error)}
        </p>
      )}
      {sp.connected === "1" && (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Connected successfully. Tokens stay on the server only.
        </p>
      )}

      {!configured && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
          <h2 className="font-medium text-amber-100">Meta App not configured yet</h2>
          <ol className="mt-3 list-decimal space-y-2 pe-4 text-amber-100/90">
            <li>
              Create an app at{" "}
              <a className="underline" href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer">
                developers.facebook.com
              </a>{" "}
              (type: Business).
            </li>
            <li>Add products: Facebook Login + Instagram Graph API.</li>
            <li>
              Valid OAuth redirect URI:{" "}
              <code className="rounded bg-black/30 px-1 text-xs">
                {process.env.NEXT_PUBLIC_SITE_URL}/api/social/meta/callback
              </code>
            </li>
            <li>
              In Vercel → Environment Variables add{" "}
              <code className="rounded bg-black/30 px-1">META_APP_ID</code> and{" "}
              <code className="rounded bg-black/30 px-1">META_APP_SECRET</code> (server only, never NEXT_PUBLIC).
            </li>
            <li>Redeploy, then use Connect below.</li>
          </ol>
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Connected accounts</h2>
            <p className="text-xs text-muted">Page tokens &amp; Instagram business accounts from Meta Business.</p>
          </div>
          {configured ? (
            <form action={startMetaConnect}>
              <button type="submit" className={btnPrimary}>
                Connect Facebook / Instagram
              </button>
            </form>
          ) : (
            <button type="button" disabled className={btnPrimary}>
              Connect (configure Meta App first)
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error.message.includes("social_connections")
              ? "Run migration 20261114000009_social_connections.sql in Supabase SQL Editor first."
              : error.message}
          </p>
        )}

        {!error && rows.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-muted">
            No accounts connected yet.
          </p>
        )}

        {fb.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-muted">Facebook pages</h3>
            <ul className="space-y-2">{fb.map((c) => <AccountRow key={c.id} c={c} />)}</ul>
          </div>
        )}
        {ig.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-muted">Instagram</h3>
            <ul className="space-y-2">{ig.map((c) => <AccountRow key={c.id} c={c} />)}</ul>
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card title="Publish" body="Create and schedule posts (next phase)." href="/admin/social" />
        <Card title="Ads insights" body="Meta Ads spend & results (next phase)." href="/admin/social" />
        <Card title="Improve" body="Recommendations from performance (next phase)." href="/admin/social" />
      </section>

      <section className="rounded-xl border border-white/10 bg-card p-5 text-sm text-muted">
        <h2 className="font-medium text-white">Security</h2>
        <ul className="mt-2 list-disc space-y-1 pe-4">
          <li>No Facebook/Instagram passwords are stored in SIRAJ.</li>
          <li>Access tokens stay on the server; only admins can manage connections.</li>
          <li>You can disconnect anytime here or revoke the app from Meta Business settings.</li>
        </ul>
      </section>
    </div>
  );
}

function AccountRow({ c }: { c: Conn }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{c.name}{c.username ? <span className="text-muted"> · @{c.username}</span> : null}</p>
        <p className="text-xs text-muted">{c.platform.replace("_", " ")}</p>
      </div>
      <form action={disconnectSocial.bind(null, c.id)}>
        <button type="submit" className={btnDanger}>
          Disconnect
        </button>
      </form>
    </li>
  );
}

function Card({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-white/10 bg-card p-4 transition hover:border-brand/40">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted">{body}</p>
    </Link>
  );
}
