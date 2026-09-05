import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { ReferralStatus } from "../types";
import { cn } from "@/lib/utils";

export type ReferralEvent = {
  event_id: string;
  event_type: string;
  timestamp: string;
  previous_status?: string;
  new_status?: ReferralStatus;
  notes?: string;
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  Approved: "bg-green-100 text-green-700 border-green-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
};

export function ReferralTimeline({ events }: { events: ReferralEvent[] }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800">Referral Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">No referral events yet.</p>
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((event, index) => (
              <motion.div
                key={event.event_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="relative pl-10"
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-slate-300 shadow-sm ring-1 ring-slate-200" />

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{event.event_type}</span>
                    {event.new_status && (
                      <Badge className={cn("px-2 py-0", STATUS_COLORS[event.new_status] || "bg-slate-100 text-slate-700 border-slate-200")}>
                        {event.new_status.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>

                  {event.notes && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (index * 0.1) + 0.2 }}
                      className="mt-2 text-sm text-slate-600 leading-relaxed"
                    >
                      {event.notes}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* End of timeline marker */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-4 border-white bg-green-500 shadow-sm ring-1 ring-green-200" />
              <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                Current State
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
