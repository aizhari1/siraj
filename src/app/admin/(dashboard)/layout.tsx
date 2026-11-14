import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "../actions";
import { btnGhost } from "@/lib/admin/ui";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
      <aside className="border-b border-white/10 bg-surface md:min-h-dvh md:border-b-0 md:border-e">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href="/admin" className="text-lg font-semibold">SIRAJ <span className="text-brand-light">Admin</span></Link>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-4 py-6 text-xs text-muted md:block">
          <p className="mb-2 truncate">{profile?.full_name || user.email}</p>
          <form action={signOut}><button className={btnGhost}>Sign out</button></form>
        </div>
      </aside>
      <main id="content" className="min-w-0 p-4 md:p-8">
        {children}
        <form action={signOut} className="mt-10 md:hidden"><button className={btnGhost}>Sign out</button></form>
      </main>
    </div>
  );
}
