"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, House, LayoutGrid, MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { Img } from "@/components/ui/media";

export type NavLabels = { home: string; about: string; services: string; portfolio: string; contact: string; menu: string; close: string; language: string };

export function Nav({ locale, labels, logo }: { locale: Locale; labels: NavLabels; logo: string }) {
  const path = usePathname() ?? `/${locale}`;
  const other: Locale = locale === "ar" ? "en" : "ar";
  const switchHref = path.replace(/^\/(ar|en)/, `/${other}`) || `/${other}`;
  const is = (h: string) => (h === `/${locale}` ? path === h : path.startsWith(h));

  const top = [
    { href: `/${locale}`, label: labels.home }, { href: `/${locale}/about`, label: labels.about },
    { href: `/${locale}/services`, label: labels.services }, { href: `/${locale}/portfolio`, label: labels.portfolio },
    { href: `/${locale}/contact`, label: labels.contact },
  ];
  const bottom = [
    { href: `/${locale}`, label: labels.home, Icon: House }, { href: `/${locale}/services`, label: labels.services, Icon: LayoutGrid },
    { href: `/${locale}/portfolio`, label: labels.portfolio, Icon: Images }, { href: `/${locale}/contact`, label: labels.contact, Icon: MessageCircle },
  ];

  return (
    <>
      <header className="pointer-events-none fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+8px)] z-50 flex items-center justify-between md:inset-x-8">
        <Link
          href={`/${locale}`}
          aria-label="SIRAJ"
          className="glass pointer-events-auto flex h-[4.25rem] items-center gap-2.5 rounded-full px-4 py-2 text-[15px] font-bold tracking-[.16em] md:h-[5.25rem] md:px-6"
        >
          {logo ? (
            <span className="relative block h-12 w-40 md:h-16 md:w-56">
              <Img
                src={logo}
                alt="SIRAJ"
                priority
                sizes="(min-width: 768px) 224px, 160px"
                className="object-contain object-start"
              />
            </span>
          ) : (
            <>
              <i className="size-3 rounded-full bg-brand-light shadow-[0_0_14px_3px_var(--color-brand)]" />
              <span className="text-lg tracking-[.2em] md:text-xl">SIRAJ</span>
            </>
          )}
        </Link>
        <nav aria-label="Main" className="tn glass pointer-events-auto">
          {top.map((l) => (
            <Link key={l.href} href={l.href} aria-current={is(l.href) ? "page" : undefined} className={is(l.href) ? "act" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href={switchHref}
          hrefLang={other}
          lang={other}
          className="glass pointer-events-auto flex h-[4.25rem] items-center rounded-full px-5 text-xs font-medium tracking-widest transition active:scale-90 md:h-[5.25rem]"
        >
          {labels.language}
        </Link>
      </header>

      <nav aria-label="Primary" className="bn glass">
        {bottom.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={is(href) ? "page" : undefined} className={is(href) ? "act" : ""}>
            <Icon className="size-[22px]" aria-hidden strokeWidth={1.8} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
