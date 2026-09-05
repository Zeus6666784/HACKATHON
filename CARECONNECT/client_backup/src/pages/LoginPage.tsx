import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert } from "../components/ui/Alert";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Login failed. Check your credentials and server connection.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="text-center space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H//9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              CareConnect <span className="text-slate-500 font-medium">Maharashtra</span>
            </CardTitle>
            <CardDescription className="text-slate-500">
              Institutional Health Continuity Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Official Email
                </label>
                <Input
                  type="email"
                  placeholder="name@hospital.gov.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Security Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-100"
                  required
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="destructive" className="border-red-200 bg-red-50/50 text-red-700">
                    {error}
                  </Alert>
                </motion.div>
              )}
              <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors">
                Authorize Access
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
