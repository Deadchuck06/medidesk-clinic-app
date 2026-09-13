import React, { useState, useEffect } from "react";
import { Patient, Visit, User } from "../types";
import { PatientRepository } from "../repositories/patientRepository";
import { AppStorage } from "../database/storage";
import { StatusBadge } from "../components/StatusBadge";
import { PrescriptionView } from "../components/PrescriptionView";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Heart,
  FileText,
  Pill,
  ArrowLeft,
  UserPlus,
  Stethoscope,
  Activity,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileSearch,
  Sparkles
} from "lucide-react";

interface PatientProfileScreenProps {
  patientId: string;
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const PatientProfileScreen: React.FC<PatientProfileScreenProps> = ({
  patientId,
  currentUser,
  onNavigate,
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [viewingPrescriptionVisit, setViewingPrescriptionVisit] = useState<Visit | null>(null);

  const refreshData = () => {
    const data = PatientRepository.getPatientHistory(patientId);
    setPatient(data.patient);
    setVisits(data.visits);
    if (data.visits.length > 0 && !expandedVisitId) {
      setExpandedVisitId(data.visits[0].id);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = AppStorage.subscribe(refreshData);
    return unsub;
  }, [patientId]);

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Patient record not found.</p>
        <button
          type="button"
          onClick={() => onNavigate("patients")}
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div id="patient-profile-screen" className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("patients")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Patient Medical Record
            </h1>
            <p className="text-xs text-slate-500">
              Complete longitudinal electronic health record across all outpatient encounters.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("add_walkin", { prefillMobile: patient.mobileNumber })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>New OPD Visit</span>
        </button>
      </div>

      {/* Patient Master Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-2xl shadow-md">
              {patient.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-900">
                  {patient.fullName}
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {patient.age} Years • {patient.gender}
                </span>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-800">
                  {patient.patientId}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <strong className="text-slate-800">{patient.mobileNumber}</strong>
                </div>
                {patient.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{patient.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Registered: {new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center self-start md:self-auto">
            <div>
              <span className="text-2xl font-black text-blue-900">{visits.length}</span>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Visits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal Popup if selected */}
      {viewingPrescriptionVisit?.prescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex justify-end pb-2">
              <button
                type="button"
                onClick={() => setViewingPrescriptionVisit(null)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close Prescription
              </button>
            </div>
            <PrescriptionView
              prescription={viewingPrescriptionVisit.prescription}
              vitals={viewingPrescriptionVisit.vitals}
            />
          </div>
        </div>
      )}

      {/* Chronological Visits History Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Consultation History & Past Visits ({visits.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Chronological timeline (Newest first)</span>
        </div>

        {visits.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <Clock className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No visits recorded for this patient.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((v, idx) => {
              const isExpanded = expandedVisitId === v.id;
              const con = v.consultation;
              const rx = v.prescription;

              return (
                <div
                  key={v.id}
                  className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all"
                >
                  {/* Visit Header */}
                  <div
                    onClick={() => setExpandedVisitId(isExpanded ? null : v.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer gap-3 border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-900 font-bold text-xs">
                        #{v.tokenNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            Visit Date: {v.visitDate} ({v.visitTime})
                          </span>
                          <StatusBadge status={v.status} size="sm" />
                          {idx === 0 && (
                            <span className="rounded-full bg-blue-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          <strong>Chief Complaint:</strong> {v.chiefConcern}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {rx && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingPrescriptionVisit(v);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                        >
                          <Pill className="h-3.5 w-3.5 text-blue-600" />
                          <span>View Prescription</span>
                        </button>
                      )}

                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Visit Details */}
                  {isExpanded && (
                    <div className="p-6 space-y-5 animate-in fade-in">
                      {/* Vitals Ribbon */}
                      {v.vitals ? (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                            Recorded Vitals
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                              <span className="text-slate-500 block text-[10px]">Blood Pressure</span>
                              <strong className="text-slate-900">{v.vitals.bpSystolic}/{v.vitals.bpDiastolic} mmHg</strong>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                              <span className="text-slate-500 block text-[10px]">Pulse Rate</span>
                              <strong className="text-slate-900">{v.vitals.pulse} bpm</strong>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                              <span className="text-slate-500 block text-[10px]">Temperature</span>
                              <strong className="text-slate-900">{v.vitals.temperature} °F</strong>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                              <span className="text-slate-500 block text-[10px]">SpO2</span>
                              <strong className="text-slate-900">{v.vitals.spo2} %</strong>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                              <span className="text-slate-500 block text-[10px]">Weight</span>
                              <strong className="text-slate-900">{v.vitals.weight} kg</strong>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                              <span className="text-slate-500 block text-[10px]">BMI</span>
                              <strong className="text-slate-900">{v.vitals.bmi || "—"}</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700 italic">No vitals recorded for this visit.</p>
                      )}

                      {/* Doctor Clinical Notes */}
                      {con ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                              <Stethoscope className="h-4 w-4" />
                              <span>Clinical Consultation Notes</span>
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {con.status}
                            </span>
                          </div>

                          <div>
                            <span className="font-bold text-slate-700">Diagnosis:</span>
                            <p className="font-bold text-blue-950 text-sm mt-0.5">{con.diagnosis || "Under Evaluation"}</p>
                          </div>

                          {con.examinationFindings && (
                            <div>
                              <span className="font-bold text-slate-700">Examination Findings:</span>
                              <p className="text-slate-800 mt-0.5 leading-relaxed">{con.examinationFindings}</p>
                            </div>
                          )}

                          {con.investigationsAdvised && (
                            <div>
                              <span className="font-bold text-slate-700">Investigations Advised:</span>
                              <p className="text-slate-800 mt-0.5">{con.investigationsAdvised}</p>
                            </div>
                          )}

                          {con.adviceAndDiet && (
                            <div>
                              <span className="font-bold text-slate-700">Advice & Lifestyle:</span>
                              <p className="text-slate-800 mt-0.5">{con.adviceAndDiet}</p>
                            </div>
                          )}

                          {con.followUpDate && (
                            <div className="pt-2 border-t border-slate-200 text-indigo-950 font-semibold">
                              Follow-Up Scheduled: {con.followUpDate} ({con.followUpInstructions || "In OPD"})
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 italic">
                          Consultation pending with Doctor.
                        </div>
                      )}

                      {/* Prescribed Medicines Summary */}
                      {rx && rx.medicines && rx.medicines.length > 0 && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                            Prescribed Medications ({rx.medicines.length})
                          </span>
                          <div className="overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <tr>
                                  <th className="py-2 px-3">Medicine</th>
                                  <th className="py-2 px-3">Dose</th>
                                  <th className="py-2 px-3">Frequency</th>
                                  <th className="py-2 px-3">Duration</th>
                                  <th className="py-2 px-3">Instructions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {rx.medicines.map((m, mIdx) => (
                                  <tr key={mIdx}>
                                    <td className="py-2 px-3 font-semibold text-slate-900">
                                      {m.medicineName} ({m.strength})
                                    </td>
                                    <td className="py-2 px-3 text-slate-700">{m.dose}</td>
                                    <td className="py-2 px-3 text-slate-700">{m.frequency}</td>
                                    <td className="py-2 px-3 text-slate-700">{m.duration}</td>
                                    <td className="py-2 px-3 text-blue-800 font-medium">{m.instructions}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Lab Reports if attached */}
                      {v.reportAnalyses && v.reportAnalyses.length > 0 && (
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block mb-2 flex items-center gap-1.5">
                            <FileSearch className="h-4 w-4 text-indigo-600" />
                            <span>Attached Lab & Diagnostic Analyses ({v.reportAnalyses.length})</span>
                          </span>
                          <div className="space-y-2">
                            {v.reportAnalyses.map((rep, rIdx) => (
                              <div key={rIdx} className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs">
                                <div className="font-bold text-indigo-950 flex items-center justify-between">
                                  <span>{rep.reportTitle}</span>
                                  <span className="text-[10px] text-indigo-700 font-semibold">{rep.reportType}</span>
                                </div>
                                <p className="text-slate-700 mt-1">{rep.conciseSummary}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Billing Information */}
                      {v.billing && (
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-500" />
                            <span className="font-semibold text-slate-700">Billing: ₹{v.billing.total}</span>
                            <span className="text-slate-400 font-mono">({v.billing.invoiceNumber})</span>
                          </div>
                          <StatusBadge status={v.billing.paymentStatus} size="sm" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
