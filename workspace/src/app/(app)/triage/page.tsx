import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";
import { TriageForm } from "@/components/TriageForm";

export default async function TriagePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === ROLES.PATIENT) redirect("/referrals");
  const { patientId } = await searchParams;
  const patients = await prisma.patient.findMany({ orderBy: { fullName: "asc" } });
  return (
    <div className="md:ml-56">
      <TriageForm patients={patients} locale={session.locale} defaultPatientId={patientId} />
    </div>
  );
}
