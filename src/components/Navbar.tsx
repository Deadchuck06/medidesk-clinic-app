import React from "react";
import { User, Role } from "../types";
import { AuthRepository } from "../repositories/authRepository";
import { AppStorage } from "../database/storage";
import {
  Stethoscope,
  UserCircle2,
  LogOut,
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  Layers,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Pill,
  CheckCircle2,
  Clock
} from "lucide-react";

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  isMobileFrame,
  onToggleFrame,
}) => {
  const isDoctor = currentUser?.role === "DOCTOR";

  const handleRoleSwitch = (targetRole: Role) => {
    const demoUsers = AuthRepository.getDemoUsers();
    const targetUser = demoUsers.find((u) => u.role === targetRole);
    if (targetUser) {
      AppStorage.setCurrentUser(targetUser);
      // Auto navigate to default dashboard
      if (targetRole === "DOCTOR") {
        onSelectTab("doctor_dashboard");
      } else {
        onSelectTab("reception_dashboard");
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm("Reset all MediDesk patients, visits, and billing records to initial demo state?")) {
      AppStorage.resetToDemoData();
      alert("Database reset to initial demo state.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      {/* Top Brand Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab(isDoctor ? "doctor_dashboard" : "reception_dashboard")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  MediDesk
                </span>
                <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                  OPD Suite
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                AI-Assisted Clinic Management Application
              </p>
            </div>
          </div>

          {/* Center Navigation for Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {isDoctor ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTab("doctor_dashboard")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "doctor_dashboard"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Doctor Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("queue")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "queue"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Today's Patients
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("patients")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "patients"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Patient Records
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("medicines")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "medicines"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Pill className="h-3.5 w-3.5" />
                  Medicine Master
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("completed_visits")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "completed_visits"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Completed Visits
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTab("reception_dashboard")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "reception_dashboard"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Reception Desk
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("add_walkin")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "add_walkin"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <UserCircle2 className="h-3.5 w-3.5" />
                  Add Walk-In
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("queue")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "queue"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Today's Queue
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("patients")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "patients"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Patients
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("billing")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "billing"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Billing
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab("analytics")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "analytics"
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  OPD Analytics
                </button>
              </>
            )}
          </nav>

          {/* Right Action Tools & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Native Android / Desktop Frame Switcher */}
            <button
              type="button"
              onClick={onToggleFrame}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              title={isMobileFrame ? "Switch to Wide Workstation View" : "Switch to Native Android Mobile Frame"}
            >
              {isMobileFrame ? (
                <>
                  <Monitor className="h-3.5 w-3.5 text-blue-600" />
                  <span className="hidden md:inline">Workstation</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                  <span className="hidden md:inline">Android Frame</span>
                </>
              )}
            </button>

            {/* Demo Reset Tool */}
            <button
              type="button"
              onClick={handleResetData}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Reset Database to Default Demo Records"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Quick Role Switcher Pill for academic field testing */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleRoleSwitch("RECEPTION")}
                className={`px-2 py-1 rounded-md transition-all ${
                  !isDoctor
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Reception
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch("DOCTOR")}
                className={`px-2 py-1 rounded-md transition-all ${
                  isDoctor
                    ? "bg-white text-indigo-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Doctor
              </button>
            </div>

            {/* User Dropdown / Logout */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || "Demo User"}
                </div>
                <div className="text-[10px] font-semibold text-blue-600">
                  {isDoctor ? "Doctor • Consultant" : "Receptionist • Frontdesk"}
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
