import React, { useState, useEffect } from "react";
import { User, Visit, Patient } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { AnalyticsRepository } from "../repositories/analyticsRepository";
import { AppStorage } from "../database/storage";
import { StatusBadge } from "../components/StatusBadge";
import {
  Users,
  Clock,
  CheckCircle2,
  CreditCard,
  UserPlus,
  Activity,
  Heart,
  ChevronRight,
  Search,
  Eye
} from "lucide-react";

interface ReceptionDashboardProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [analytics, setAnalytics] = useState(AnalyticsRepository.getAnalytics());

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

  return (
    <div id="reception-dashboard" className="space-y-4 animate-in fade-in duration-200">
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
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">tokens issued</p>
        </div>

        <div
          onClick={() => onNavigate("queue")}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-amber-400 transition-colors cursor-pointer"
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Waiting</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {analytics.waitingPatients < 10 ? `0${analytics.waitingPatients}` : analytics.waitingPatients}
          </p>
          <p className="text-[10px] text-amber-600 mt-1 font-medium">in lounge</p>
        </div>

        <div
          onClick={() => onNavigate("completed_visits")}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {analytics.completedPatients < 10 ? `0${analytics.completedPatients}` : analytics.completedPatients}
          </p>
          <p className="text-[10px] text-blue-600 mt-1 font-medium">consulted</p>
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

      {/* High Density Quick Workflow Actions Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Front Desk Actions:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate("add_walkin")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-xs"
          >
            + Register Walk-In
          </button>
          <button
            type="button"
            onClick={() => onNavigate("queue")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded border border-slate-200 transition-colors"
          >
            Live Queue ({todayVisits.length})
          </button>
          <button
            type="button"
            onClick={() => onNavigate("billing")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded border border-slate-200 transition-colors"
          >
            Billing Desk
          </button>
          <button
            type="button"
            onClick={() => onNavigate("patients")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded border border-slate-200 transition-colors"
          >
            Patient Directory
          </button>
        </div>
      </div>

      {/* Main High Density Patient Queue Table */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Today's OPD Queue & Triage Desk
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            Total Tokens: {todayVisits.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                <th className="px-4 py-2.5">Token</th>
                <th className="px-4 py-2.5">Patient Name</th>
                <th className="px-4 py-2.5">Mobile</th>
                <th className="px-4 py-2.5">Concern</th>
                <th className="px-4 py-2.5">Triage Vitals</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {todayVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    No walk-in registrations today yet.
                  </td>
                </tr>
              ) : (
                todayVisits.map((visit) => {
                  const patient = getPatient(visit.patientId);
                  const hasVitals = !!visit.vitals;
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
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-600">
                        #{visit.tokenNumber < 10 ? `00${visit.tokenNumber}` : `0${visit.tokenNumber}`}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">
                        <span
                          onClick={() =>
                            onNavigate("patient_profile", { patientId: visit.patientId })
                          }
                          className="cursor-pointer hover:underline"
                        >
                          {patient?.fullName}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {patient?.age}Y • {patient?.gender}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">
                        {patient?.mobileNumber}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 italic max-w-[160px] truncate">
                        {visit.chiefConcern}
                      </td>
                      <td className="px-4 py-2.5">
                        {hasVitals ? (
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                              BP {visit.vitals?.bpSystolic}/{visit.vitals?.bpDiastolic}
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                              {visit.vitals?.pulse} bpm
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate("vitals", {
                                visitId: visit.id,
                                patientId: visit.patientId,
                              })
                            }
                            className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded text-[10px] font-bold"
                          >
                            + Record Vitals
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={visit.status} size="sm" />
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate("vitals", {
                              visitId: visit.id,
                              patientId: visit.patientId,
                            })
                          }
                          className="text-slate-600 hover:text-blue-600 font-bold text-xs"
                        >
                          Vitals
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate("billing", {
                              visitId: visit.id,
                              patientId: visit.patientId,
                            })
                          }
                          className="text-blue-600 hover:underline font-bold text-xs"
                        >
                          Bill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
