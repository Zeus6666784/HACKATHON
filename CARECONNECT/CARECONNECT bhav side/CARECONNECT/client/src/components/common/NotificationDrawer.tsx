import { Bell, X, Check, AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import type { Notification } from "../../types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onDismiss
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-label="CareConnect Notifications"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical Alerts &amp; Events</h2>
              <p className="text-xs text-slate-500">{unreadCount} unread updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bell className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No active alerts</p>
              <p className="text-xs text-slate-400 mt-1">All clinical referrals and follow-ups are up to date.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const icon = {
                URGENT: <AlertCircle className="w-4 h-4 text-rose-600" />,
                WARNING: <AlertTriangle className="w-4 h-4 text-amber-600" />,
                SUCCESS: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                INFO: <Info className="w-4 h-4 text-sky-600" />
              }[notif.type];

              const border = {
                URGENT: "border-l-rose-500 bg-rose-50/40",
                WARNING: "border-l-amber-500 bg-amber-50/40",
                SUCCESS: "border-l-emerald-500 bg-emerald-50/40",
                INFO: "border-l-sky-500 bg-sky-50/40"
              }[notif.type];

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border border-slate-200 border-l-4 ${border} shadow-sm relative group transition hover:shadow`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      {notif.referralId && (
                        <span className="inline-block mt-2 font-mono text-[10px] font-semibold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                          {notif.referralId}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onDismiss(notif.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition p-1"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500">
            CareConnect Maharashtra Automated Push Dispatch
          </p>
        </div>
      </div>
    </div>
  );
}
