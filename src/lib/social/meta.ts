import "server-only";

/** Meta Graph API helpers. Tokens never leave the server. */

const GRAPH = "https://graph.facebook.com/v21.0";

export function metaAppConfigured() {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function getMetaAppId() {
  const id = process.env.META_APP_ID;
  if (!id) throw new Error("META_APP_ID is not set");
  return id;
}

export function getMetaAppSecret() {
  const s = process.env.META_APP_SECRET;
  if (!s) throw new Error("META_APP_SECRET is not set");
  return s;
}

/** Scopes for page + IG business publishing and basic insights */
export const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",");

export function buildMetaOAuthUrl(state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: getMetaAppId(),
    redirect_uri: redirectUri,
    state,
    scope: META_SCOPES,
    response_type: "code",
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: getMetaAppId(),
    client_secret: getMetaAppSecret(),
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch(`${GRAPH}/oauth/access_token?${params}`);
  const data = (await res.json()) as { access_token?: string; error?: { message: string } };
  if (!data.access_token) throw new Error(data.error?.message ?? "Token exchange failed");
  return data.access_token;
}

export async function exchangeForLongLivedUserToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: getMetaAppId(),
    client_secret: getMetaAppSecret(),
    fb_exchange_token: shortToken,
  });
  const res = await fetch(`${GRAPH}/oauth/access_token?${params}`);
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message: string };
  };
  if (!data.access_token) throw new Error(data.error?.message ?? "Long-lived token exchange failed");
  return {
    access_token: data.access_token,
    expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
  };
}

export type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
};

export async function listManagedPages(userToken: string): Promise<MetaPage[]> {
  const params = new URLSearchParams({
    fields: "id,name,access_token,instagram_business_account",
    access_token: userToken,
  });
  const res = await fetch(`${GRAPH}/me/accounts?${params}`);
  const data = (await res.json()) as { data?: MetaPage[]; error?: { message: string } };
  if (data.error) throw new Error(data.error.message);
  return data.data ?? [];
}

export async function getInstagramProfile(igUserId: string, pageToken: string) {
  const params = new URLSearchParams({
    fields: "id,username,name,profile_picture_url",
    access_token: pageToken,
  });
  const res = await fetch(`${GRAPH}/${igUserId}?${params}`);
  const data = (await res.json()) as {
    id?: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
    error?: { message: string };
  };
  if (data.error) throw new Error(data.error.message);
  return data;
}
