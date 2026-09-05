"use client";

import { useAuth } from "@/context/AuthContext";
import { t } from "@/lib/i18n";

export default function ProfilePage() {
  const { session, loading } = useAuth();

  if (loading) return <div className="md:ml-56 p-8 text-center">Loading...</div>;
  if (!session) return null;

  const locale = session.locale || "en";

  return (
    <div className="md:ml-56 p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t(locale, "profile")}</h1>
        <p className="text-sm text-cyan-800">{t(locale, "profileSubtitle") || "Manage your account details"}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-cyan-100 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Full Name</label>
            <p className="text-lg font-medium text-slate-900">{session.fullName}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Username</label>
            <p className="text-lg font-medium text-slate-900">{session.username}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Role</label>
            <p className="text-lg font-medium text-slate-900">{session.role.replace("_", " ")}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">User ID</label>
            <p className="text-lg font-medium text-slate-900">{session.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-200 max-w-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-cyan-900">Get the Mobile App</h3>
          <p className="text-sm text-cyan-700">Install our Android app for easier access on the go.</p>
        </div>
        <a
          href="/app-release.apk"
          download
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm"
        >
          Install App
        </a>
      </div>
    </div>
  );
}
