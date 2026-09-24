import React, { useState, useEffect } from "react";
import { User, TabType, Role } from "./types";
import { AuthRepository } from "./repositories/authRepository";
import { AppStorage } from "./database/storage";
import {
  Stethoscope,
  Clock,
  Users,
  Pill,
  CheckCircle2,
  BarChart3,
  UserPlus,
  CreditCard,
  Calendar,
  Layers,
  Search,
  LogOut,
  RotateCcw,
  Menu,
  X,
  FileSearch,
  Activity,
  UserCheck
} from "lucide-react";

// Screens
import { LoginScreen } from "./screens/LoginScreen";
import { ReceptionDashboard } from "./screens/ReceptionDashboard";
import { DoctorDashboard } from "./screens/DoctorDashboard";
import { AddWalkInScreen } from "./screens/AddWalkInScreen";
import { VitalsScreen } from "./screens/VitalsScreen";
import { QueueScreen } from "./screens/QueueScreen";
import { ConsultationScreen } from "./screens/ConsultationScreen";
import { PatientsListScreen } from "./screens/PatientsListScreen";
import { PatientProfileScreen } from "./screens/PatientProfileScreen";
import { MedicineMasterScreen } from "./screens/MedicineMasterScreen";
import { CompletedVisitsScreen } from "./screens/CompletedVisitsScreen";
import { BillingScreen } from "./screens/BillingScreen";
import { OpdAnalyticsScreen } from "./screens/OpdAnalyticsScreen";
import { FollowUpsScreen } from "./screens/FollowUpsScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(AuthRepository.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [navigationContext, setNavigationContext] = useState<any>({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize storage demo data if empty
 useEffect(() => {
  AppStorage.init();

  AuthRepository.logout();
  setCurrentUser(null);
  setActiveTab("login");
}, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === "DOCTOR" ? "doctor_dashboard" : "reception_dashboard");
    setNavigationContext({});
  };

  const handleLogout = () => {
    AuthRepository.logout();
    setCurrentUser(null);
    setActiveTab("login");
    setNavigationContext({});
  };

  const handleSwitchRole = (targetRole?: Role) => {
    if (targetRole) {
      const demoUsers = AuthRepository.getDemoUsers();
      const targetUser = demoUsers.find((u) => u.role === targetRole);
      if (targetUser) {
        AppStorage.setCurrentUser(targetUser);
        setCurrentUser(targetUser);
        setActiveTab(targetRole === "DOCTOR" ? "doctor_dashboard" : "reception_dashboard");
        setNavigationContext({});
        return;
      }
    }
    const switched = AuthRepository.switchRole();
    setCurrentUser(switched);
    setActiveTab(switched.role === "DOCTOR" ? "doctor_dashboard" : "reception_dashboard");
    setNavigationContext({});
  };

  const handleResetData = () => {
    if (window.confirm("Reset all MediDesk clinic records to initial demo state?")) {
      AppStorage.resetToDemoData();
      window.location.reload();
    }
  };

  const handleNavigate = (tab: string, contextData?: any) => {
    setActiveTab(tab);
    if (contextData) {
      setNavigationContext(contextData);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If not logged in, render the login screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isDoctor = currentUser.role === "DOCTOR";

  // Tab Title helper
  const getTabTitle = () => {
    switch (activeTab) {
      case "doctor_dashboard":
        return "Doctor Dashboard";
      case "reception_dashboard":
        return "Reception Dashboard";
      case "queue":
        return "Patient Queue";
      case "add_walkin":
        return "New Patient Registration";
      case "vitals":
        return "Vitals Recording & Triage";
      case "consultation":
        return "Clinical Consultation & Rx";
      case "patients":
        return "Patient Directory";
      case "patient_profile":
        return "Patient Health Record";
      case "medicines":
        return "Medicine Master Formulary";
      case "completed_visits":
        return "Completed Visits Archive";
      case "billing":
        return "OPD Billing & Invoices";
      case "analytics":
        return "OPD Performance Analytics";
      case "followups":
        return "Follow-Up Schedules";
      default:
        return isDoctor ? "Doctor Dashboard" : "Reception Dashboard";
    }
  };

  // Render content
  const renderContent = () => {
    switch (activeTab) {
      case "reception_dashboard":
      case "dashboard":
        return currentUser.role === "DOCTOR" ? (
          <DoctorDashboard currentUser={currentUser} onNavigate={handleNavigate} />
        ) : (
          <ReceptionDashboard currentUser={currentUser} onNavigate={handleNavigate} />
        );

      case "doctor_dashboard":
        return <DoctorDashboard currentUser={currentUser} onNavigate={handleNavigate} />;

      case "queue":
        return <QueueScreen currentUser={currentUser} onNavigate={handleNavigate} />;

      case "add_walkin":
        return (
          <AddWalkInScreen
            currentUser={currentUser}
            initialMobile={navigationContext?.prefillMobile}
            onNavigate={handleNavigate}
          />
        );

      case "vitals":
        return (
          <VitalsScreen
            visitId={navigationContext?.visitId || ""}
            patientId={navigationContext?.patientId || ""}
            onNavigate={handleNavigate}
          />
        );

      case "consultation":
        return (
          <ConsultationScreen
            visitId={navigationContext?.visitId || ""}
            patientId={navigationContext?.patientId || ""}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case "patients":
        return <PatientsListScreen currentUser={currentUser} onNavigate={handleNavigate} />;

      case "patient_profile":
        return (
          <PatientProfileScreen
            patientId={navigationContext?.patientId || ""}
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        );

      case "medicines":
        return <MedicineMasterScreen />;

      case "completed_visits":
        return <CompletedVisitsScreen currentUser={currentUser} onNavigate={handleNavigate} />;

      case "billing":
        return (
          <BillingScreen
            currentUser={currentUser}
            initialVisitId={navigationContext?.visitId}
            onNavigate={handleNavigate}
          />
        );

      case "analytics":
        return <OpdAnalyticsScreen currentUser={currentUser} onNavigate={handleNavigate} />;

      case "followups":
        return <FollowUpsScreen currentUser={currentUser} onNavigate={handleNavigate} />;

      default:
        return currentUser.role === "DOCTOR" ? (
          <DoctorDashboard currentUser={currentUser} onNavigate={handleNavigate} />
        ) : (
          <ReceptionDashboard currentUser={currentUser} onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - High Density Dark Slate Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-slate-900 flex-shrink-0 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigate(isDoctor ? "doctor_dashboard" : "reception_dashboard")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm">
              M
            </div>
            <div>
              <h1 className="text-white font-bold leading-none text-sm tracking-tight">MediDesk</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Clinic Management
              </p>
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-white lg:hidden p-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {isDoctor ? (
            <>
              <div
                onClick={() => handleNavigate("doctor_dashboard")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "doctor_dashboard"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "doctor_dashboard" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Dashboard</span>
              </div>

              <div
                onClick={() => handleNavigate("queue")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "queue"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "queue" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Patient Queue</span>
              </div>

              <div
                onClick={() => handleNavigate("patients")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "patients" || activeTab === "patient_profile"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "patients" || activeTab === "patient_profile"
                      ? "bg-blue-500"
                      : "border border-slate-600"
                  }`}
                />
                <span>Patient Records</span>
              </div>

              <div
                onClick={() => handleNavigate("medicines")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "medicines"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "medicines" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Medicine Library</span>
              </div>

              <div
                onClick={() => handleNavigate("completed_visits")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "completed_visits"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "completed_visits" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Completed Visits</span>
              </div>

              <div
                onClick={() => handleNavigate("followups")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "followups"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "followups" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Follow-Ups</span>
              </div>

              <div
                onClick={() => handleNavigate("analytics")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "analytics"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "analytics" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Analytics</span>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => handleNavigate("reception_dashboard")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "reception_dashboard"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "reception_dashboard" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Dashboard</span>
              </div>

              <div
                onClick={() => handleNavigate("add_walkin")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "add_walkin"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "add_walkin" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Add Walk-In</span>
              </div>

              <div
                onClick={() => handleNavigate("queue")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "queue"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "queue" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Patient Queue</span>
              </div>

              <div
                onClick={() => handleNavigate("patients")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "patients" || activeTab === "patient_profile"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "patients" || activeTab === "patient_profile"
                      ? "bg-blue-500"
                      : "border border-slate-600"
                  }`}
                />
                <span>Patient Records</span>
              </div>

              <div
                onClick={() => handleNavigate("billing")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "billing"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "billing" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Billing Desk</span>
              </div>

              <div
                onClick={() => handleNavigate("analytics")}
                className={`rounded px-3 py-2 text-sm flex items-center gap-3 cursor-pointer transition-colors ${
                  activeTab === "analytics"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    activeTab === "analytics" ? "bg-blue-500" : "border border-slate-600"
                  }`}
                />
                <span>Analytics</span>
              </div>
            </>
          )}
        </nav>

        {/* Bottom Role & User Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-xs text-white truncate font-medium">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400">
                {isDoctor ? "Chief Physician" : "Reception Officer"}
              </p>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="mt-3 flex items-center rounded bg-slate-800 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleSwitchRole("RECEPTION")}
              className={`flex-1 py-1 text-center rounded transition-all ${
                !isDoctor ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Reception
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRole("DOCTOR")}
              className={`flex-1 py-1 text-center rounded transition-all ${
                isDoctor ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Doctor
            </button>
          </div>

          <div
            onClick={handleLogout}
            className="mt-3 flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-bold cursor-pointer transition-colors"
          >
            <LogOut className="h-3 w-3" />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Container */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* High Density Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-600 hover:text-slate-900 lg:hidden p-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
              {getTabTitle()}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-tight hidden sm:inline-block">
              Active Session
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Consultation / Walk-in Button */}
            {isDoctor ? (
              <button
                type="button"
                onClick={() => handleNavigate("queue")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 sm:px-4 py-1.5 rounded transition-colors shadow-xs"
              >
                New Consultation
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate("add_walkin")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 sm:px-4 py-1.5 rounded transition-colors shadow-xs"
              >
                + Walk-In Patient
              </button>
            )}

            {/* Reset demo data */}
            <button
              type="button"
              onClick={handleResetData}
              title="Reset Demo Records"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Screen View with High Density Canvas */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-5 flex flex-col">
          <div className="flex-grow">{renderContent()}</div>

          {/* Academic & Clinical Safety Disclaimer */}
          <footer className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
            <p className="font-semibold text-slate-600">
              MediDesk – High-Density AI-Assisted Outpatient Clinic Workstation
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400 max-w-2xl mx-auto">
              Clinical decision support is strictly assistive. All recommendations and prescriptions
              require validation by a licensed medical practitioner.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
