import React, { useState, useEffect } from "react";
import { Patient, Visit, User } from "../types";
import { PatientRepository } from "../repositories/patientRepository";
import { AppStorage } from "../database/storage";
import {
  Users,
  Search,
  UserPlus,
  Calendar,
  History,
  Phone,
  FileText,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface PatientsListScreenProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const PatientsListScreen: React.FC<PatientsListScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    patient: Patient;
    matchedVisits: Visit[];
    matchReason: string;
  }[]>([]);

  const refreshList = () => {
    setSearchResults(PatientRepository.search(searchQuery));
  };

  useEffect(() => {
    refreshList();
    const unsub = AppStorage.subscribe(refreshList);
    return unsub;
  }, [searchQuery]);

  return (
    <div id="patients-list-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Patient Master Directory
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {searchResults.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Search patient records across Name, Mobile Number, Diagnosis, or Chief Complaint.
          </p>
        </div>

        {currentUser.role !== "DOCTOR" && (
          <button
            type="button"
            onClick={() => onNavigate("add_walkin")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Patient Name, Mobile (e.g. 9876543210), Diagnosis (e.g. Hypertension), or Chief Concern (e.g. Fever)..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {searchQuery && (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
            <span>Showing results matching: <strong className="text-blue-700">"{searchQuery}"</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Patients Grid / List */}
      <div className="space-y-3">
        {searchResults.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-xs">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-800">No patient records found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No existing patient matched the term "{searchQuery}". You can register a new walk-in patient.
            </p>
            {currentUser.role !== "DOCTOR" && (
              <button
                type="button"
                onClick={() => onNavigate("add_walkin")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register Patient</span>
              </button>
            )}
          </div>
        ) : (
          searchResults.map(({ patient, matchedVisits, matchReason }) => {
            const lastVisit = matchedVisits[0];
            const lastDiagnosis =
              lastVisit?.consultation?.diagnosis || lastVisit?.prescription?.diagnosis || "Routine Consultation";

            return (
              <div
                key={patient.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Patient Details */}
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-base">
                    {patient.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {patient.fullName}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500">
                        ({patient.age}y / {patient.gender})
                      </span>
                      <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {patient.patientId}
                      </span>
                      {matchReason !== "All records" && (
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          {matchReason}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {patient.mobileNumber}
                      </span>
                      {patient.address && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate max-w-xs">{patient.address}</span>
                        </>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-700">
                        {matchedVisits.length} Recorded Visit(s)
                      </span>
                    </div>

                    {lastVisit && (
                      <div className="mt-2 text-xs flex flex-wrap items-center gap-2">
                        <span className="text-slate-500">Last Diagnosis:</span>
                        <span className="font-bold text-indigo-950 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                          {lastDiagnosis}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({new Date(lastVisit.createdAt).toLocaleDateString()})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate("patient_profile", { patientId: patient.id })}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  >
                    <History className="h-3.5 w-3.5 text-blue-600" />
                    <span>View Medical Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate("add_walkin", { prefillMobile: patient.mobileNumber })}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>New Visit</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
