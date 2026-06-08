"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/actions";
import { KeyRound, Lock, User, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Harap masukkan username dan password!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await loginUser({ username: username.trim(), password: password.trim() });
      if (res.success) {
        router.refresh();
        router.push("/");
      } else {
        setErrorMsg(res.error || "Gagal masuk. Cek kredensial Anda.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080710] flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* Background Ambient Glowing Lights */}
      <div className="absolute top-[-15%] left-[-10%] w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-[80px] sm:blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 opacity-20 blur-[80px] sm:blur-[120px] animate-pulse pointer-events-none" />

      {/* Login Card Container */}
      <div className="relative w-full max-w-[420px] z-10">
        <div className="glass-card bg-white/[0.03] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col space-y-8">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/20">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h1 className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-2xl sm:text-3xl font-extrabold text-transparent tracking-tight">
                GOGOMI
              </h1>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
                Internal Panel Secure Sign In
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs font-bold text-red-400 text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-[13px] text-muted-foreground">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-[13px] text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all font-medium"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white py-3 text-sm font-bold shadow-lg shadow-violet-500/20 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Memproses Masuk...
                </>
              ) : (
                "Masuk Ke Panel"
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground/60 font-semibold tracking-wider uppercase">
              PORTAL HANYA UNTUK PENGGUNA BERWENANG
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
