import React, { useState, useEffect } from "react";
import { Visit, Patient, User, QueueStatus } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { AppStorage } from "../database/storage";
import { StatusBadge } from "../components/StatusBadge";
import {
  Clock,
  Search,
  Users,
  Stethoscope,
  Activity,
  CreditCard,
  UserPlus,
  Heart,
  Eye
} from "lucide-react";

interface QueueScreenProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [todayVisits, setTodayVisits] = useState<Visit[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | QueueStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const isDoctor = currentUser.role === "DOCTOR";

  const refreshData = () => {
    setTodayVisits(VisitRepository.getTodayVisits());
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

  const filteredVisits = todayVisits.filter((visit) => {
    const patient = getPatient(visit.patientId);
    if (activeFilter !== "ALL" && visit.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = patient?.fullName.toLowerCase().includes(q);
      const mobMatch = patient?.mobileNumber.includes(q);
      const concernMatch = visit.chiefConcern.toLowerCase().includes(q);
      const tokenMatch = visit.tokenNumber.toString().includes(q);
      return nameMatch || mobMatch || concernMatch || tokenMatch;
    }
    return true;
  });

  const waitingCount = todayVisits.filter((v) => v.status === "WAITING").length;
  const inConsultCount = todayVisits.filter((v) => v.status === "IN_CONSULTATION").length;
  const completedCount = todayVisits.filter((v) => v.status === "COMPLETED").length;

  return (
    <div id="queue-screen" className="space-y-4 animate-in fade-in duration-200">
      {/* High Density Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({todayVisits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("WAITING")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "WAITING"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Waiting ({waitingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("IN_CONSULTATION")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "IN_CONSULTATION"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            Consulting ({inConsultCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("COMPLETED")}
            className={`px-3 py-1 rounded text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px] sm:min-w-[240px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, token..."
            className="w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Outpatient Queue • {filteredVisits.length} Records
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Real-Time Progression</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                <th className="px-4 py-2.5">No</th>
                <th className="px-4 py-2.5">Patient Details</th>
                <th className="px-4 py-2.5">Chief Concern</th>
                <th className="px-4 py-2.5">Vitals (Triage)</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    No patients match the current queue criteria.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => {
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
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-500">
                        #{visit.tokenNumber < 10 ? `00${visit.tokenNumber}` : `0${visit.tokenNumber}`}
                      </td>
                      <td className="px-4 py-2.5">
                        <div
                          onClick={() =>
                            onNavigate("patient_profile", { patientId: visit.patientId })
                          }
                          className="font-bold text-slate-800 cursor-pointer hover:underline"
                        >
                          {patient?.fullName || "Patient"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {patient?.age}Y / {patient?.gender} • {patient?.mobileNumber}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 italic max-w-[180px] truncate">
                        {visit.chiefConcern}
                      </td>
                      <td className="px-4 py-2.5">
                        {hasVitals ? (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                              BP {visit.vitals?.bpSystolic}/{visit.vitals?.bpDiastolic}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
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
                        {isDoctor ? (
                          <button
                            type="button"
                            onClick={() => handleStartConsultation(visit)}
                            className={`font-bold text-xs ${
                              isCompleted
                                ? "text-slate-500 hover:text-slate-700"
                                : isConsulting
                                ? "text-blue-600 hover:underline"
                                : "text-indigo-600 hover:underline"
                            }`}
                          >
                            {isCompleted
                              ? "View Rx"
                              : isConsulting
                              ? "Resume Consultation →"
                              : "Consult →"}
                          </button>
                        ) : (
                          <>
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
                            {isCompleted && (
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigate("billing", {
                                    visitId: visit.id,
                                    patientId: visit.patientId,
                                  })
                                }
                                className="text-emerald-600 hover:underline font-bold text-xs"
                              >
                                Bill
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
