import React, { useState, useEffect } from "react";
import { Visit, Patient, User } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { AppStorage } from "../database/storage";
import { StatusBadge } from "../components/StatusBadge";
import { PrescriptionView } from "../components/PrescriptionView";
import {
  CheckCircle2,
  Search,
  Calendar,
  Pill,
  CreditCard,
  Eye,
  FileText,
  User as UserIcon,
  X,
  Stethoscope
} from "lucide-react";

interface CompletedVisitsScreenProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const CompletedVisitsScreen: React.FC<CompletedVisitsScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [completedVisits, setCompletedVisits] = useState<Visit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const refreshData = () => {
    setCompletedVisits(VisitRepository.getCompletedVisits());
  };

  useEffect(() => {
    refreshData();
    const unsub = AppStorage.subscribe(refreshData);
    return unsub;
  }, []);

  const getPatient = (patientId: string): Patient | null => {
    return PatientRepository.getById(patientId);
  };

  const filteredVisits = completedVisits.filter((v) => {
    const patient = getPatient(v.patientId);
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      patient?.fullName.toLowerCase().includes(q) ||
      patient?.mobileNumber.includes(q) ||
      v.consultation?.diagnosis?.toLowerCase().includes(q) ||
      v.prescription?.diagnosis?.toLowerCase().includes(q) ||
      v.tokenNumber.toString().includes(q)
    );
  });

  return (
    <div id="completed-visits-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Completed OPD Encounters
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {completedVisits.length} Consultations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Archive of finalized patient consultations with electronic prescriptions and invoices.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed encounters by patient name, mobile, diagnosis, or token..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table of Completed Visits */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredVisits.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <h4 className="text-base font-bold text-slate-800">No completed visits found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Once a doctor finalizes a consultation, the record will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredVisits.map((visit) => {
              const patient = getPatient(visit.patientId);
              const diagnosis =
                visit.consultation?.diagnosis || visit.prescription?.diagnosis || "OPD Consultation";

              return (
                <div
                  key={visit.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-black text-sm">
                      #{visit.tokenNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{patient?.fullName}</h3>
                        <span className="text-xs font-semibold text-slate-500">
                          ({patient?.age}y / {patient?.gender})
                        </span>
                        <StatusBadge status="COMPLETED" size="sm" />
                      </div>

                      <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><strong>Diagnosis:</strong> <span className="font-bold text-indigo-950">{diagnosis}</span></span>
                        <span className="text-slate-300">•</span>
                        <span>Date: {visit.visitDate} ({visit.visitTime})</span>
                        <span className="text-slate-300">•</span>
                        <span>Mobile: {patient?.mobileNumber}</span>
                      </div>

                      {visit.prescription?.medicines && (
                        <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
                          <Pill className="h-3 w-3 text-blue-600" />
                          <span>
                            <strong>Rx:</strong> {visit.prescription.medicines.map((m) => m.medicineName).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {visit.billing && (
                      <div className="text-right mr-2 hidden sm:block">
                        <div className="text-xs font-black text-slate-900">₹{visit.billing.total}</div>
                        <StatusBadge status={visit.billing.paymentStatus} size="sm" />
                      </div>
                    )}

                    {visit.prescription && (
                      <button
                        type="button"
                        onClick={() => setSelectedVisit(visit)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100 shadow-2xs"
                      >
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>Prescription</span>
                      </button>
                    )}

                    {currentUser.role !== "DOCTOR" && (
                      <button
                        type="button"
                        onClick={() => onNavigate("billing", { visitId: visit.id })}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-2xs"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{visit.billing?.paymentStatus === "Paid" ? "Receipt" : "Billing"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {selectedVisit && selectedVisit.prescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">Consultation Record Summary</span>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <PrescriptionView
              prescription={selectedVisit.prescription}
              vitals={selectedVisit.vitals}
              onClose={() => setSelectedVisit(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
