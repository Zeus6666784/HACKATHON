"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { flushQueue, listQueue } from "@/lib/offline";
import { t } from "@/lib/i18n";

export function OfflineBanner({ locale }: { locale?: string }) {
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      setQueued(listQueue().length);
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const id = setInterval(update, 4000);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      clearInterval(id);
    };
  }, []);

  async function sync() {
    setSyncing(true);
    const left = await flushQueue();
    setQueued(left.length);
    setSyncing(false);
  }

  if (online && queued === 0) return null;

  return (
    <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200">
      <p className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" aria-hidden />
        {online ? t(locale, "syncQueue") : t(locale, "offline")}
        {queued > 0 ? ` (${queued})` : ""}
      </p>
      {queued > 0 && online ? (
        <button
          type="button"
          onClick={sync}
          disabled={syncing}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-3 font-medium text-primary shadow-soft"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {t(locale, "syncNow")}
        </button>
      ) : null}
    </div>
  );
}
