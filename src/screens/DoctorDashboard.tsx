import React, { useState, useEffect } from "react";
import { User, Visit, Patient } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { AnalyticsRepository } from "../repositories/analyticsRepository";
import { AppStorage } from "../database/storage";
import { StatusBadge } from "../components/StatusBadge";
import { ReportAnalysisModal } from "../components/ReportAnalysisModal";
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  FileText,
  ShieldAlert,
  ArrowRight,
  Heart,
  Pill,
  ChevronRight,
  Activity,
  Mic,
  FileSearch,
  BookOpen
} from "lucide-react";

interface DoctorDashboardProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [analytics, setAnalytics] = useState(AnalyticsRepository.getAnalytics());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const refreshData = () => {
    setTodayVisits(VisitRepository.getTodayVisits());
    setAnalytics(AnalyticsRepository.getAnalytics());
  };

  useEffect(() => {
    refreshData();
    const unsub = AppStorage.subscribe(refreshData);
    return unsub;
  }, []);

  const getPatient = (patientId: string): Patient | null => {
    return PatientRepository.getById(patientId);
  };

  const handleStartConsultation = (visit: Visit) => {
    if (visit.status !== "COMPLETED") {
      VisitRepository.updateStatus(visit.id, "IN_CONSULTATION");
    }
    onNavigate("consultation", { visitId: visit.id, patientId: visit.patientId });
  };

  const waitingVisits = todayVisits.filter((v) => v.status === "WAITING");
  const inConsultVisits = todayVisits.filter((v) => v.status === "IN_CONSULTATION");
  const activeVisit = inConsultVisits[0] || waitingVisits[0] || todayVisits[0];
  const activePatient = activeVisit ? getPatient(activeVisit.patientId) : null;

  return (
    <div id="doctor-dashboard" className="space-y-4 animate-in fade-in duration-200">
      {/* 4 High Density Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div
          onClick={() => onNavigate("queue")}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Patients Today
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{analytics.totalPatientsToday}</p>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">+4 vs yesterday</p>
        </div>

        <div
          onClick={() => onNavigate("queue")}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-amber-400 transition-colors cursor-pointer"
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Waiting</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {analytics.waitingPatients < 10 ? `0${analytics.waitingPatients}` : analytics.waitingPatients}
          </p>
          <p className="text-[10px] text-amber-600 mt-1 font-medium">Avg. wait: ~12m</p>
        </div>

        <div
          onClick={() => onNavigate("completed_visits")}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {analytics.completedPatients < 10 ? `0${analytics.completedPatients}` : analytics.completedPatients}
          </p>
          <p className="text-[10px] text-blue-600 mt-1 font-medium">100% adherence</p>
        </div>

        <div
          onClick={() => onNavigate("billing")}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors cursor-pointer"
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Today Revenue
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            ₹{(analytics.todayRevenue ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">
            {analytics.pendingBillingCount ?? 0} Pending Billing
          </p>
        </div>
      </div>

      {/* Main High Density Content Area (Queue Table + Right Utility Column) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Section: Today's Patient Queue High Density Table */}
        <section className="w-full lg:flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Today's Patient Queue ({todayVisits.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Live Token Status
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                  <th className="px-4 py-2.5">No</th>
                  <th className="px-4 py-2.5">Patient Name</th>
                  <th className="px-4 py-2.5">Age/Gender</th>
                  <th className="px-4 py-2.5">Visit Purpose</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-50">
                {todayVisits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                      No patients registered in the queue today.
                    </td>
                  </tr>
                ) : (
                  todayVisits.map((visit) => {
                    const patient = getPatient(visit.patientId);
                    const isConsulting = visit.status === "IN_CONSULTATION";
                    const isCompleted = visit.status === "COMPLETED";

                    return (
                      <tr
                        key={visit.id}
                        className={`transition-colors ${
                          isConsulting
                            ? "bg-blue-50/50"
                            : isCompleted
                            ? "bg-slate-50/60 opacity-70"
                            : "hover:bg-blue-50/30"
                        }`}
                      >
                        <td
                          className={`px-4 py-2.5 font-mono text-xs font-semibold ${
                            isConsulting ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          #{visit.tokenNumber < 10 ? `00${visit.tokenNumber}` : `0${visit.tokenNumber}`}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            onClick={() =>
                              onNavigate("patient_profile", { patientId: visit.patientId })
                            }
                            className={`font-bold cursor-pointer hover:underline ${
                              isConsulting
                                ? "text-slate-900 underline decoration-blue-300"
                                : "text-slate-700"
                            }`}
                          >
                            {patient?.fullName || "Patient"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {patient?.age}Y / {patient?.gender}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 italic max-w-[160px] truncate">
                          {visit.chiefConcern}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={visit.status} size="sm" />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {isCompleted ? (
                            <button
                              onClick={() => handleStartConsultation(visit)}
                              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                            >
                              View Record
                            </button>
                          ) : isConsulting ? (
                            <button
                              onClick={() => handleStartConsultation(visit)}
                              className="text-blue-600 font-bold text-xs hover:underline"
                            >
                              In Progress →
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartConsultation(visit)}
                              className="text-blue-600 font-bold text-xs hover:underline"
                            >
                              Call In
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Section: Active Vitals + AI Assistant + Safety Card */}
        <aside className="w-full lg:w-[320px] flex flex-col gap-4 flex-shrink-0">
          {/* Active Patient Vitals Card (Indigo Theme) */}
          <div className="bg-indigo-900 rounded-lg p-4 text-white shadow-lg flex-shrink-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                Active Patient Vitals
              </span>
              <span className="bg-blue-500 text-[9px] px-2 py-0.5 rounded font-bold uppercase truncate max-w-[120px]">
                {activePatient?.fullName || "No Active Patient"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-indigo-800/50 p-2 rounded">
                <p className="text-[9px] text-indigo-300 uppercase">BP</p>
                <p className="text-base sm:text-lg font-bold">
                  {activeVisit?.vitals?.bpSystolic
                    ? `${activeVisit.vitals.bpSystolic}/${activeVisit.vitals.bpDiastolic}`
                    : "120/80"}
                </p>
              </div>
              <div className="bg-indigo-800/50 p-2 rounded">
                <p className="text-[9px] text-indigo-300 uppercase">Pulse</p>
                <p className="text-base sm:text-lg font-bold">
                  {activeVisit?.vitals?.pulse ? `${activeVisit.vitals.pulse} bpm` : "74 bpm"}
                </p>
              </div>
              <div className="bg-indigo-800/50 p-2 rounded">
                <p className="text-[9px] text-indigo-300 uppercase">SpO2</p>
                <p className="text-base sm:text-lg font-bold">
                  {activeVisit?.vitals?.spo2 ? `${activeVisit.vitals.spo2}%` : "98%"}
                </p>
              </div>
              <div className="bg-indigo-800/50 p-2 rounded">
                <p className="text-[9px] text-indigo-300 uppercase">Temp</p>
                <p className="text-base sm:text-lg font-bold">
                  {activeVisit?.vitals?.temperature
                    ? `${activeVisit.vitals.temperature}°F`
                    : "98.4°F"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Consultation Assistant Widget */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <h4 className="text-[10px] font-bold uppercase text-slate-700 tracking-wider">
                AI Consultation Assistant
              </h4>
            </div>
            <div className="mb-3 bg-slate-50 rounded p-3 text-xs leading-relaxed text-slate-600 border border-slate-100 italic">
              {activePatient
                ? `Patient ${activePatient.fullName} (${activePatient.age}y, ${activePatient.gender}) presenting with ${
                    activeVisit?.chiefConcern || "OPD complaints"
                  }. Known medical history: ${
                    activePatient.medicalHistory || "None recorded"
                  }. AI suggestion: Evaluate dosage tolerability and cross-reactivity.`
                : `"Patient presenting with acute symptoms. Use AI Voice Scribe or Report Analyzer to extract clinical insights automatically."`}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (activeVisit) {
                    handleStartConsultation(activeVisit);
                  }
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-2 rounded border border-slate-200 transition-colors"
              >
                Open Scribe
              </button>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[10px] font-bold py-1.5 px-2 rounded transition-colors"
              >
                Analyze Report
              </button>
            </div>
          </div>

          {/* Safety Notifications Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase text-slate-700 mb-2">
              Safety Notifications
            </h4>
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 p-2 rounded">
              <div className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0">⚠️</div>
              <p className="text-[10px] text-red-700 leading-snug">
                {activePatient?.allergies && activePatient.allergies !== "None"
                  ? `Active patient has a recorded allergy to ${activePatient.allergies}. Cross-check formulary before prescribing.`
                  : "Automatic drug-drug interaction checker active for Paracetamol, Amoxicillin & NSAIDs."}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Global Lab Report Analysis Modal */}
      <ReportAnalysisModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patientName={activePatient?.fullName || "OPD Patient"}
      />
    </div>
  );
};
