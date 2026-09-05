import type { ReferralStatus } from "../types";
import { StatusBadge } from "./StatusBadge";

export type ReferralEvent = {
  event_id: string;
  event_type: string;
  timestamp: string;
  previous_status?: string;
  new_status?: ReferralStatus;
  notes?: string;
};

export function ReferralTimeline({ events }: { events: ReferralEvent[] }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-bold">Referral Timeline</h2>
      <div className="mt-4 space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No referral events yet.</p>
        ) : events.map((event) => (
          <div key={event.event_id} className="border-l-2 border-slate-200 pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{event.event_type}</span>
              {event.new_status && <StatusBadge value={event.new_status} />}
            </div>
            <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
            {event.notes && <p className="mt-1 text-sm">{event.notes}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
