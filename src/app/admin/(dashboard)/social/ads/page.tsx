import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { btnGhost } from "@/lib/admin/ui";
import { buildTips, getCampaignInsights, listAdAccounts, type CampaignInsight } from "@/lib/social/ads";

export default async function SocialAdsPage() {
  const { supabase } = await requireAdmin();

  const { data: conns } = await supabase
    .from("social_connections")
    .select("id,name,access_token,platform,is_active")
    .eq("is_active", true)
    .eq("platform", "facebook_page")
    .limit(5);

  let accountsError: string | null = null;
  let insights: CampaignInsight[] = [];
  let accountLabel = "";

  // Page tokens often cannot list ad accounts; need user token with ads_read.
  // We try the first page token and surface a clear error if permission is missing.
  const token = conns?.[0]?.access_token;
  if (!token) {
    accountsError = "Connect a Facebook Page first from Social, then grant ads permissions in the Meta App.";
  } else {
    try {
      const accounts = await listAdAccounts(token);
      if (accounts.length === 0) {
        accountsError =
          "No ad accounts returned. Add ads_read (and ads_management if needed) to the Meta App, reconnect, and ensure your user is admin on the ad account.";
      } else {
        const act = accounts[0];
        accountLabel = act.name || act.account_id;
        insights = await getCampaignInsights(act.id, token, 30);
      }
    } catch (e) {
      accountsError = (e as Error).message;
    }
  }

  const tips = buildTips(insights);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ads insights</h1>
          <p className="mt-1 text-sm text-muted">Meta campaigns — last 30 days. Tokens never leave the server.</p>
        </div>
        <Link href="/admin/social" className={btnGhost}>
          ← Social
        </Link>
      </div>

      {accountsError && (
        <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
          <p className="font-medium">Could not load ad accounts</p>
          <p className="mt-2 opacity-90">{accountsError}</p>
          <ul className="mt-3 list-disc space-y-1 pe-4 text-xs opacity-90">
            <li>In Meta App → Permissions: request <code className="rounded bg-black/30 px-1">ads_read</code>.</li>
            <li>Reconnect Facebook from Social after the app review / permission change.</li>
            <li>Your Meta user must be admin on the Business ad account.</li>
          </ul>
        </section>
      )}

      {accountLabel && (
        <p className="text-sm text-muted">
          Account: <span className="text-white">{accountLabel}</span>
        </p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-medium">Campaigns</h2>
        {insights.length === 0 && !accountsError ? (
          <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-muted">No insights in this period.</p>
        ) : insights.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Campaign</th>
                  <th className="px-3 py-2 font-medium">Spend</th>
                  <th className="px-3 py-2 font-medium">Impr.</th>
                  <th className="px-3 py-2 font-medium">Clicks</th>
                  <th className="px-3 py-2 font-medium">CTR</th>
                  <th className="px-3 py-2 font-medium">CPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-card">
                {insights.map((r) => (
                  <tr key={r.campaign_id}>
                    <td className="max-w-[12rem] truncate px-3 py-2">{r.campaign_name}</td>
                    <td className="px-3 py-2 tabular-nums">{r.spend}</td>
                    <td className="px-3 py-2 tabular-nums">{r.impressions}</td>
                    <td className="px-3 py-2 tabular-nums">{r.clicks}</td>
                    <td className="px-3 py-2 tabular-nums">{r.ctr}</td>
                    <td className="px-3 py-2 tabular-nums">{r.cpc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-white/10 bg-card p-5">
        <h2 className="text-lg font-medium">Improvement tips</h2>
        <ul className="mt-3 list-disc space-y-2 pe-4 text-sm text-muted">
          {tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
