import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, 
  Stethoscope, 
  ShieldCheck, 
  HeartHandshake, 
  Lock, 
  Mail, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import type { Role } from "../types";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("doctor.nashik@maharashtra.gov.in");
  const [password, setPassword] = useState("Hospital@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Login verification failed. Check server connection or use quick demo login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickRoleLogin(roleEmail: string, rolePass: string) {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
    setLoading(true);
    try {
      await login(roleEmail, rolePass);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-400 text-xs tracking-wider">सार्वजनिक आरोग्य विभाग</span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400">Government of Maharashtra</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">National Health Mission</span>
        </div>
      </div>

      {/* Main Center Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white text-slate-900 p-8 shadow-2xl border border-slate-200">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white font-black text-2xl shadow-lg shadow-teal-700/30">
              CC
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 pt-2">
              CareConnect <span className="text-teal-700">Maharashtra</span>
            </h1>
            <p className="text-xs text-slate-500">
              Statewide Inter-Facility Referral &amp; Continuity-of-Care Network
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Email / ABHA Linked ID:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="doctor@health.maharashtra.gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-3 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Sign in to Clinical Portal"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins by Persona */}
          <div className="mt-6 border-t border-slate-100 pt-5 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Role Login (Demo Presets):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin("doctor.nashik@maharashtra.gov.in", "Hospital@123")}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-left transition"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-slate-800">Doctor (Nashik)</div>
                  <div className="text-[9px] text-slate-400 truncate">Clinical Care</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin("asha.khodala@maharashtra.gov.in", "Worker@123")}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-left transition"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-slate-800">Health Worker</div>
                  <div className="text-[9px] text-slate-400 truncate">PHC Intake</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin("staff.pune@maharashtra.gov.in", "Facility@123")}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-left transition"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-slate-800">Facility Staff</div>
                  <div className="text-[9px] text-slate-400 truncate">Queue &amp; Beds</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin("director.mumbai@maharashtra.gov.in", "Admin@123")}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-200 text-left transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-slate-800">State Director</div>
                  <div className="text-[9px] text-slate-400 truncate">KPI Dashboard</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
        CareConnect Maharashtra · Referral Continuity Layer · Strictly for Authorized Healthcare Personnel
      </footer>
    </main>
  );
}
