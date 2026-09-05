import { motion } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { TriageResult } from "../types";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-green-50 text-green-700 border-green-200",
};

export function TriageResultCard({ result }: { result: TriageResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">AI Triage Result</CardTitle>
            <Badge className={cn("px-3 py-1", PRIORITY_COLORS[result.priority] || "bg-slate-100 text-slate-700 border-slate-200")}>
              {result.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-sm font-medium text-slate-900">Suggested Care Level</p>
              <p className="text-sm text-slate-600">{result.suggestedCareLevel}</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 border border-slate-100 italic">
            "{result.reasoning}"
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span>Next Action: {result.recommendedNextAction}</span>
          </div>

          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="font-medium">{result.caution}</p>
          </div>

          <p className="text-center text-[10px] uppercase tracking-wider text-slate-400 pt-2">
            Source: {result.source}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
