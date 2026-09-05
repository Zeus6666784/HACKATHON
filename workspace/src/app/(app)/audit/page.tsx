import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { ROLES } from "@/lib/constants";

export default async function AuditPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== ROLES.ADMIN) redirect("/dashboard");
  const logs = await prisma.auditLog.findMany({
    take: 80,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, role: true } } },
  });
  return (
    <div className="md:ml-56 space-y-3">
      <h1 className="font-display text-2xl font-bold">{t(session.locale, "audit")}</h1>
      {logs.map((l) => (
        <article key={l.id} className="card-soft p-4 text-sm">
          <p className="font-semibold">
            {l.action} · {l.entity}
          </p>
          <p className="text-cyan-800">{l.detail}</p>
          <p className="text-xs text-cyan-700">
            {l.user?.fullName ?? "system"} · {l.createdAt.toLocaleString()}
          </p>
        </article>
      ))}
    </div>
  );
}
