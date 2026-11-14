import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

const PUBLIC_ADMIN = ["/admin/login", "/admin/unauthorized"];

/** Refreshes the Supabase session and sends signed-out visitors to the login page.
 *  Role (admin) is verified again on the server in requireAdmin(); this is only the first gate. */
async function adminGuard(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = req.nextUrl;
  const isPublic = PUBLIC_ADMIN.includes(pathname);

  if (!user && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (user && pathname === "/admin/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGuard(req);

  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  const accept = req.headers.get("accept-language") ?? "";
  const locale = accept.toLowerCase().startsWith("en") ? "en" : defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
