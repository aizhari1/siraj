import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en"><body style={{ background: "#0B0D10", color: "#fff", fontFamily: "system-ui", display: "grid", placeItems: "center", minHeight: "100dvh", margin: 0, textAlign: "center" }}>
      <div><h1 style={{ fontSize: "2rem" }}>404</h1><p style={{ color: "#A1A1AA" }}>الصفحة غير موجودة · Page not found</p>
        <p style={{ marginTop: 24 }}><Link href="/ar" style={{ color: "#A78BFA", marginInline: 12 }}>العربية</Link><Link href="/en" style={{ color: "#A78BFA", marginInline: 12 }}>English</Link></p></div>
    </body></html>
  );
}
