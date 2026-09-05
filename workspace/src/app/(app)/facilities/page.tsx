import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import { FacilitiesClient } from "@/components/FacilitiesClient";

export default async function FacilitiesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const facilities = await prisma.facility.findMany({ orderBy: [{ taluka: "asc" }, { careLevel: "asc" }] });
  return (
    <div className="md:ml-56">
      <h1 className="font-display text-2xl font-bold">{t(session.locale, "map")}</h1>
      <p className="mb-4 text-sm text-cyan-800">{t(session.locale, "publicFacility")} · OpenStreetMap</p>
      <FacilitiesClient
        locale={session.locale}
        facilities={facilities.map((f) => ({
          id: f.id,
          name: f.name,
          careLevel: f.careLevel,
          taluka: f.taluka,
          village: f.village,
          latitude: f.latitude,
          longitude: f.longitude,
          services: f.services,
          isPublic: f.isPublic,
          isSynthetic: f.isSynthetic,
        }))}
      />
    </div>
  );
}
