import React, { useState, useEffect } from "react";
import { Visit, Patient, User } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { AppStorage } from "../database/storage";
import {
  Calendar,
  Clock,
  Search,
  UserPlus,
  Phone,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface FollowUpsScreenProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const FollowUpsScreen: React.FC<FollowUpsScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [followUpVisits, setFollowUpVisits] = useState<Visit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshData = () => {
    const all = VisitRepository.getAll();
    const scheduled = all.filter(
      (v) =>
        (v.consultation?.followUpRequired && v.consultation.followUpDate) ||
        (v.prescription?.followUpDate)
    );
    setFollowUpVisits(scheduled);
  };

  useEffect(() => {
    refreshData();
    const unsub = AppStorage.subscribe(refreshData);
    return unsub;
  }, []);

  const getPatient = (patientId: string): Patient | null => {
    return PatientRepository.getById(patientId);
  };

  const filtered = followUpVisits.filter((v) => {
    const patient = getPatient(v.patientId);
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      patient?.fullName.toLowerCase().includes(q) ||
      patient?.mobileNumber.includes(q) ||
      v.consultation?.diagnosis?.toLowerCase().includes(q)
    );
  });

  return (
    <div id="followups-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Scheduled Patient Follow-Ups
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
              {followUpVisits.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track patients due for follow-up review consultations and medication tapering.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheduled follow-ups by patient name, mobile, diagnosis..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-800">No scheduled follow-ups found</h4>
            <p className="text-xs text-slate-500 mt-1">
              When doctors assign follow-up dates during consultation, they will appear in this tracker.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((visit) => {
              const patient = getPatient(visit.patientId);
              const followUpDate =
                visit.consultation?.followUpDate || visit.prescription?.followUpDate;
              const followUpInst =
                visit.consultation?.followUpInstructions ||
                visit.prescription?.followUpInstructions ||
                "Routine OPD Review";
              const diagnosis =
                visit.consultation?.diagnosis || visit.prescription?.diagnosis || "OPD Case";

              return (
                <div
                  key={visit.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-sm">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{patient?.fullName}</h3>
                        <span className="text-xs font-semibold text-slate-500">
                          ({patient?.age}y / {patient?.gender})
                        </span>
                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-900">
                          Due: {followUpDate}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><strong>Previous Diagnosis:</strong> <span className="font-bold text-blue-900">{diagnosis}</span></span>
                        <span className="text-slate-300">•</span>
                        <span>Mobile: {patient?.mobileNumber}</span>
                      </div>

                      <div className="mt-1.5 text-xs text-indigo-950 font-medium bg-indigo-50/60 p-2 rounded-xl">
                        <strong>Doctor's Instructions:</strong> {followUpInst}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => onNavigate("patient_profile", { patientId: visit.patientId })}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      History
                    </button>

                    {currentUser.role !== "DOCTOR" && patient && (
                      <button
                        type="button"
                        onClick={() => onNavigate("add_walkin", { prefillMobile: patient.mobileNumber })}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Register Follow-Up Visit</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
