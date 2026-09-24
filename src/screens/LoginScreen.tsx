import React, { useState } from "react";
import { Role, User } from "../types";
import { AuthRepository } from "../repositories/authRepository";
import { Stethoscope, ShieldCheck, UserCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

interface LoginScreenProps {
  onLogin?: (user: User) => void;
  onLoginSuccess?: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<Role>("RECEPTION");
  const [email, setEmail] = useState("reception@medidesk.clinic");
  const [password, setPassword] = useState("reception123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccessfulAuth = (user: User) => {
    if (onLogin) onLogin(user);
    if (onLoginSuccess) onLoginSuccess(user);
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "RECEPTION") {
      setEmail("reception@medidesk.clinic");
      setPassword("reception123");
    } else {
      setEmail("doctor.shukla@medidesk.clinic");
      setPassword("doctor123");
    }
  };

  const handleQuickLogin = (role: Role) => {
    setErrorMessage(null);
    const targetEmail =
      role === "RECEPTION" ? "reception@medidesk.clinic" : "doctor.shukla@medidesk.clinic";
    const res = AuthRepository.login(targetEmail, "demo123", role);
    if (res.success && res.user) {
      handleSuccessfulAuth(res.user);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your clinic email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = AuthRepository.login(email, password, selectedRole);
      setIsSubmitting(false);

      if (res.success && res.user) {
        handleSuccessfulAuth(res.user);
      } else {
        setErrorMessage(res.message || "Invalid credentials provided.");
      }
    }, 150);
  };

  return (
    <div
      id="login-screen-container"
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-6"
    >
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25 mb-3 ring-4 ring-white/10">
            <Stethoscope className="h-9 w-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            MediDesk
          </h1>
          <p className="text-sm font-medium text-blue-200/90 mt-1">
            Clinic Management Application
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-200">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>AI-Assisted OPD Clinical Workflow</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  id="role-btn-reception"
                  onClick={() => handleRoleChange("RECEPTION")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === "RECEPTION"
                      ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Reception</span>
                </button>
                <button
                  type="button"
                  id="role-btn-doctor"
                  onClick={() => handleRoleChange("DOCTOR")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    selectedRole === "DOCTOR"
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Stethoscope className="h-4 w-4" />
                  <span>Doctor</span>
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clinic Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@medidesk.clinic"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div
                id="login-error-message"
                className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? "Authenticating..." : `Sign In as ${selectedRole === "DOCTOR" ? "Doctor" : "Receptionist"}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              1-Click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                id="quick-login-reception"
                onClick={() => handleQuickLogin("RECEPTION")}
                className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 text-left hover:bg-blue-100/80 hover:border-blue-300 transition-all group"
              >
                <div className="font-bold text-blue-950 flex items-center justify-between">
                  <span>Reception Desk</span>
                  <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">Enter →</span>
                </div>
                <div className="text-[10px] text-blue-700/80 truncate mt-0.5 font-mono">reception@medidesk.clinic</div>
              </button>
              <button
                type="button"
                id="quick-login-doctor"
                onClick={() => handleQuickLogin("DOCTOR")}
                className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-2.5 text-left hover:bg-indigo-100/80 hover:border-indigo-300 transition-all group"
              >
                <div className="font-bold text-indigo-950 flex items-center justify-between">
                  <span>Doctor Dashboard</span>
                  <span className="text-[10px] text-indigo-600 font-semibold group-hover:underline">Enter →</span>
                </div>
                <div className="text-[10px] text-indigo-700/80 truncate mt-0.5 font-mono">doctor.shukla@medidesk.clinic</div>
              </button>
            </div>
          </div>
        </div>

        {/* Academic Prototype Disclaimer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>B.Sc. Computer Science Academic Field Project • MediDesk OPD</span>
          </p>
        </div>
      </div>
    </div>
  );
};
