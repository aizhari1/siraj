import "server-only";

const GRAPH = "https://graph.facebook.com/v21.0";

export type AdAccount = { id: string; name: string; account_id: string; currency?: string };

export type CampaignInsight = {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  reach?: string;
  actions?: { action_type: string; value: string }[];
};

export async function listAdAccounts(userOrPageToken: string): Promise<AdAccount[]> {
  const params = new URLSearchParams({
    fields: "id,name,account_id,currency",
    access_token: userOrPageToken,
  });
  const res = await fetch(`${GRAPH}/me/adaccounts?${params}`);
  const data = (await res.json()) as { data?: AdAccount[]; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return data.data ?? [];
}

/** Last N days campaign-level insights for an ad account (act_…). */
export async function getCampaignInsights(
  adAccountId: string,
  token: string,
  days = 30,
): Promise<CampaignInsight[]> {
  const act = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const until = new Date().toISOString().slice(0, 10);
  const params = new URLSearchParams({
    level: "campaign",
    fields: "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,reach,actions",
    time_range: JSON.stringify({ since, until }),
    limit: "50",
    access_token: token,
  });
  const res = await fetch(`${GRAPH}/${act}/insights?${params}`);
  const data = (await res.json()) as { data?: CampaignInsight[]; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return data.data ?? [];
}

export function buildTips(rows: CampaignInsight[]): string[] {
  const tips: string[] = [];
  if (rows.length === 0) {
    tips.push("No campaign data in this period. Run at least one Meta campaign to unlock insights.");
    return tips;
  }

  const sortedSpend = [...rows].sort((a, b) => Number(b.spend) - Number(a.spend));
  const top = sortedSpend[0];
  const lowCtr = [...rows].filter((r) => Number(r.ctr) > 0).sort((a, b) => Number(a.ctr) - Number(b.ctr))[0];
  const highCpc = [...rows].filter((r) => Number(r.cpc) > 0).sort((a, b) => Number(b.cpc) - Number(a.cpc))[0];

  if (top) {
    tips.push(
      `Highest spend: “${top.campaign_name}” (${top.spend}). Check if results match the budget before scaling.`,
    );
  }
  if (lowCtr && Number(lowCtr.ctr) < 1) {
    tips.push(
      `Low CTR on “${lowCtr.campaign_name}” (${lowCtr.ctr}%). Test a stronger first image and a clearer first line.`,
    );
  }
  if (highCpc && Number(highCpc.cpc) > 2) {
    tips.push(
      `High CPC on “${highCpc.campaign_name}” (${highCpc.cpc}). Narrow the audience or refresh creative to reduce cost.`,
    );
  }
  tips.push("Publish 3–5 organic posts per week on the same offers as your ads to improve relevance.");
  tips.push("Review placements: feed vs stories often need different crop and caption length.");
  return tips;
}
