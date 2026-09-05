"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ClipboardList,
  Hospital,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Users,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { OfflineBanner } from "./OfflineBanner";
import { SyntheticMark } from "./StatusBadge";
import type { SessionUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = user.locale;

  const items = [
    { href: "/dashboard", label: t(locale, "dashboard"), icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.FACILITY_STAFF, ROLES.HEALTH_WORKER] },
    { href: "/referrals", label: t(locale, "referrals"), icon: ClipboardList, roles: Object.values(ROLES) },
    { href: "/patients", label: t(locale, "patients"), icon: Users, roles: [ROLES.ADMIN, ROLES.HEALTH_WORKER, ROLES.FACILITY_STAFF] },
    { href: "/facilities", label: t(locale, "map"), icon: MapPinned, roles: Object.values(ROLES) },
    { href: "/triage", label: t(locale, "newReferral"), icon: Activity, roles: [ROLES.ADMIN, ROLES.HEALTH_WORKER, ROLES.FACILITY_STAFF] },
  ].filter((i) => i.roles.includes(user.role));

  async function logout() {
    await fetch("http://localhost:5000/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh pb-24 md:pb-8">
      <header className="sticky top-0 z-20 border-b border-cyan-100/80 bg-[#ecfeff]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href={user.role === ROLES.PATIENT ? "/referrals" : "/dashboard"} className="min-h-11">
            <p className="font-display text-base font-bold leading-tight text-cyan-950">{t(locale, "appName")}</p>
            <p className="text-[11px] text-cyan-800/80">{t(locale, "tagline")}</p>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitch locale={locale} />
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white text-cyan-900 shadow-soft"
              aria-label={t(locale, "logout")}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <OfflineBanner locale={locale} />
      <div className="mx-auto max-w-6xl px-4 pt-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SyntheticMark localeLabel={t(locale, "synthetic")} />
          <span className="text-xs text-cyan-900/80">
            {t(locale, "welcome")}, {user.fullName}
          </span>
        </div>
        {children}
        <p className="mt-8 pb-6 text-center text-sm font-medium text-cyan-900">
          {t(locale, "mission")}
        </p>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cyan-100 bg-white/95 pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {items.slice(0, 5).map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] ${
                    active ? "font-semibold text-primary" : "text-cyan-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <aside className="fixed left-4 top-24 hidden w-52 md:block">
        <div className="card-soft p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm ${
                      active ? "bg-cyan-50 font-semibold text-primary" : "text-cyan-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {user.role === ROLES.ADMIN ? (
              <li>
                <Link href="/audit" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-cyan-900">
                  <Hospital className="h-4 w-4" />
                  {t(locale, "audit")}
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </aside>
    </div>
  );
}
