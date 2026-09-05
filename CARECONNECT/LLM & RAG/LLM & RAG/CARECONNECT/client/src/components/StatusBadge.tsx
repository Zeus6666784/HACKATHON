import type { Priority, ReferralStatus } from "../types";

export function StatusBadge({ value }: { value: Priority | ReferralStatus }) {
  return (
    <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold">
      {value.replaceAll("_", " ")}
    </span>
  );
}
