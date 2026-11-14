import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { metaAppConfigured } from "@/lib/social/meta";
import { btnGhost, btnPrimary, btnDanger } from "@/lib/admin/ui";
import { disconnectSocial, startMetaConnect } from "./actions";
import { ComposeForm, type ConnOption } from "./compose";
import { deleteSocialPost } from "./post-actions";

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

type PostRow = {
  id: string;
  status: string;
  caption: string;
  scheduled_at: string | null;
  published_at: string | null;
  error: string | null;
  created_at: string;
  connection_id: string;
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
  const connOptions: ConnOption[] = rows.map((r) => ({
    id: r.id,
    platform: r.platform,
    name: r.name,
    username: r.username,
  }));

  const { data: posts } = await supabase
    .from("social_posts")
    .select("id,status,caption,scheduled_at,published_at,error,created_at,connection_id")
    .order("created_at", { ascending: false })
    .limit(40);

  const postRows = (posts ?? []) as PostRow[];
  const nameById = new Map(rows.map((r) => [r.id, r.name]));

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Social</h1>
        <p className="mt-1 text-sm text-muted">
          Facebook &amp; Instagram — connect, compose, schedule, publish. Passwords are never stored.
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
              <code className="rounded bg-black/30 px-1">META_APP_SECRET</code> (server only).
            </li>
            <li>Run SQL migration <code className="rounded bg-black/30 px-1">20261114000009_social_connections.sql</code> then Redeploy.</li>
          </ol>
        </section>
      )}

      <section className="rounded-xl border border-white/10 bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Connected accounts</h2>
            <p className="text-xs text-muted">Official Meta OAuth — revoke anytime.</p>
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
            {error.message.includes("social_connections") || error.code === "42P01"
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

      <ComposeForm connections={connOptions} />

      <section>
        <h2 className="mb-3 text-lg font-medium">Recent posts</h2>
        {postRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted">No posts yet.</p>
        ) : (
          <ul className="divide-y divide-white/5 rounded-xl border border-white/10 bg-card">
            {postRows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{nameById.get(p.connection_id) ?? "Account"}</p>
                  <p className="mt-1 line-clamp-2 text-muted">{p.caption || "(no caption)"}</p>
                  {p.error && <p className="mt-1 text-xs text-red-300">{p.error}</p>}
                  <p className="mt-1 text-xs text-muted">
                    {p.status}
                    {p.scheduled_at && ` · scheduled ${new Date(p.scheduled_at).toLocaleString()}`}
                    {p.published_at && ` · published ${new Date(p.published_at).toLocaleString()}`}
                  </p>
                </div>
                <form action={deleteSocialPost.bind(null, p.id)}>
                  <button type="submit" className={btnDanger}>
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-card p-4">
          <p className="font-medium">Ads insights</p>
          <p className="mt-1 text-xs text-muted">Meta Ads spend &amp; results — next phase after accounts are connected.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-card p-4">
          <p className="font-medium">Improve</p>
          <p className="mt-1 text-xs text-muted">Recommendations from post &amp; ad performance — coming next.</p>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-card p-5 text-sm text-muted">
        <h2 className="font-medium text-white">Security</h2>
        <ul className="mt-2 list-disc space-y-1 pe-4">
          <li>No Facebook/Instagram passwords are stored in SIRAJ.</li>
          <li>Access tokens stay on the server; only admins can manage connections and posts.</li>
          <li>Disconnect here or revoke the app from Meta Business settings anytime.</li>
        </ul>
        <p className="mt-3">
          <Link href="/admin" className="text-brand-light underline">
            Back to overview
          </Link>
        </p>
      </section>
    </div>
  );
}

function AccountRow({ c }: { c: Conn }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {c.name}
          {c.username ? <span className="text-muted"> · @{c.username}</span> : null}
        </p>
        <p className="text-xs text-muted">{c.platform.replaceAll("_", " ")}</p>
      </div>
      <form action={disconnectSocial.bind(null, c.id)}>
        <button type="submit" className={btnDanger}>
          Disconnect
        </button>
      </form>
    </li>
  );
}
