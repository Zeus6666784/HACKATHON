import { FormEvent, useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try { await login(email, password); }
    catch { setError("Login failed. Check your credentials and server connection."); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">CareConnect Maharashtra</h1>
        <p className="mt-1 text-sm text-slate-500">Referral-continuity layer for rural healthcare.</p>
        <label className="mt-6 block text-sm font-medium">Email
          <input className="mt-1 w-full rounded-lg border p-3" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="mt-4 block text-sm font-medium">Password
          <input className="mt-1 w-full rounded-lg border p-3" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white">Login</button>
      </form>
    </main>
  );
}
