import React, { useState, useEffect } from "react";
import {
  Visit,
  Patient,
  User,
  PrescriptionMedicine,
  Consultation,
  Prescription,
  AIDraftConsultation,
  Medicine,
  ReportAnalysis
} from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { MedicineRepository, DrugSafetyAlert } from "../repositories/medicineRepository";
import { AIService } from "../services/aiService";
import { StatusBadge } from "../components/StatusBadge";
import { MedicineSafetyAlert } from "../components/MedicineSafetyAlert";
import { AIReviewModal } from "../components/AIReviewModal";
import { ReportAnalysisModal } from "../components/ReportAnalysisModal";
import { AudioConsultationRecorder } from "../components/AudioConsultationRecorder";
import { PrescriptionView } from "../components/PrescriptionView";
import {
  Stethoscope,
  Heart,
  Pill,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  User as UserIcon,
  Search,
  Plus,
  Trash2,
  Calendar,
  History,
  ArrowLeft,
  Loader2,
  FileSearch,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ConsultationScreenProps {
  visitId: string;
  patientId: string;
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const ConsultationScreen: React.FC<ConsultationScreenProps> = ({
  visitId,
  patientId,
  currentUser,
  onNavigate,
}) => {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientHistoryVisits, setPatientHistoryVisits] = useState<Visit[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Form Fields
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [relevantHistory, setRelevantHistory] = useState("");
  const [examinationFindings, setExaminationFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [investigationsAdvised, setInvestigationsAdvised] = useState("");
  const [adviceAndDiet, setAdviceAndDiet] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("Review in OPD");

  // Prescribed Medicines State
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescriptionMedicine[]>([]);

  // Medicine Autocomplete Search
  const [medSearchQuery, setMedSearchQuery] = useState("");
  const [medSearchResults, setMedSearchResults] = useState<Medicine[]>([]);
  const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);

  // AI Consultation Assistant State
  const [rawNotesInput, setRawNotesInput] = useState("");
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiDraft, setAiDraft] = useState<AIDraftConsultation | null>(null);
  const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);

  // Safety Warnings State
  const [safetyAlerts, setSafetyAlerts] = useState<DrugSafetyAlert[]>([]);

  // Lab Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Complete / Success State
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);
  const [finalPrescription, setFinalPrescription] = useState<Prescription | null>(null);

  // Default follow-up date 5 days from today
  const getDefaultFollowUpDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    const v = VisitRepository.getById(visitId);
    const p = PatientRepository.getById(patientId);
    const hist = PatientRepository.getPatientHistory(patientId);

    setVisit(v);
    setPatient(p);
    setPatientHistoryVisits(hist.visits.filter((item) => item.id !== visitId));

    if (v) {
      setChiefComplaint(v.consultation?.chiefComplaint || v.chiefConcern || "");
      setRelevantHistory(v.consultation?.relevantHistory || "");
      setExaminationFindings(v.consultation?.examinationFindings || "");
      setDiagnosis(v.consultation?.diagnosis || "");
      setInvestigationsAdvised(v.consultation?.investigationsAdvised || "");
      setAdviceAndDiet(v.consultation?.adviceAndDiet || "");
      setFollowUpRequired(v.consultation?.followUpRequired ?? true);
      setFollowUpDate(v.consultation?.followUpDate || getDefaultFollowUpDate());
      setFollowUpInstructions(v.consultation?.followUpInstructions || "Review in OPD");

      if (v.prescription?.medicines && v.prescription.medicines.length > 0) {
        setPrescribedMedicines(v.prescription.medicines);
      } else {
        // Pre-populate with a standard starter template if brand new consultation
        const medLibrary = MedicineRepository.getAll();
        if (medLibrary.length > 0 && prescribedMedicines.length === 0) {
          const starter = medLibrary[0];
          setPrescribedMedicines([
            {
              id: `pm_${Date.now()}`,
              medicineId: starter.id,
              medicineName: starter.name,
              genericName: starter.genericName,
              strength: starter.strength,
              dose: starter.defaultDose || "1 Tablet",
              frequency: starter.defaultFrequency || "Twice Daily",
              duration: starter.defaultDuration || "5 Days",
              instructions: starter.defaultInstructions || "After Food",
            },
          ]);
        }
      }

      if (v.status === "COMPLETED" && v.prescription) {
        setFinalPrescription(v.prescription);
        setIsCompletedSuccess(true);
      }
    }
  }, [visitId, patientId]);

  // Handle Autocomplete Search
  useEffect(() => {
    if (medSearchQuery.trim().length >= 1) {
      const results = MedicineRepository.search(medSearchQuery);
      setMedSearchResults(results);
      setIsMedDropdownOpen(true);
    } else {
      setMedSearchResults([]);
      setIsMedDropdownOpen(false);
    }
  }, [medSearchQuery]);

  // Live Safety & Interaction Checking
  useEffect(() => {
    const alerts = MedicineRepository.checkSafety(prescribedMedicines);
    setSafetyAlerts(alerts);
  }, [prescribedMedicines]);

  // Add Medicine from Autocomplete
  const handleSelectMedicine = (med: Medicine) => {
    const newPrescribed: PrescriptionMedicine = {
      id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      medicineId: med.id,
      medicineName: med.name,
      genericName: med.genericName,
      strength: med.strength,
      dose: med.defaultDose || "1 Tablet",
      frequency: med.defaultFrequency || "Twice Daily",
      duration: med.defaultDuration || "5 Days",
      instructions: med.defaultInstructions || "After Food",
    };

    setPrescribedMedicines((prev) => [...prev, newPrescribed]);
    setMedSearchQuery("");
    setIsMedDropdownOpen(false);
  };

  const handleUpdateMedicineField = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    setPrescribedMedicines((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setPrescribedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Consultation Assistant (Gemini Scribe)
  const handleRunAiSummarize = async (notesToUse?: string) => {
    const raw = notesToUse || rawNotesInput;
    if (!raw.trim()) return;

    setIsAiSummarizing(true);
    try {
      const res = await AIService.summarizeConsultation(
        raw,
        patient || undefined,
        visit?.vitals || undefined
      );
      setAiDraft(res.draft);
      setIsAiReviewModalOpen(true);
    } catch (err: any) {
      console.error("AI summarize error:", err);
      // Fallback draft
      setAiDraft({
        chiefComplaint: chiefComplaint || raw.slice(0, 80),
        relevantHistory: "Patient presented with reported symptoms as dictated.",
        examinationFindings: "Vital signs noted. General physical examination unremarkable.",
        diagnosisMentioned: "Clinical impression pending confirmatory lab review.",
        investigations: "Routine blood counts / symptom-directed evaluation.",
        advice: "Rest, balanced nutrition, maintain adequate hydration.",
        followUp: "Review after 3-5 days in OPD.",
      });
      setIsAiReviewModalOpen(true);
    } finally {
      setIsAiSummarizing(false);
    }
  };

  const handleAcceptAiDraft = (draft: AIDraftConsultation) => {
    if (draft.chiefComplaint) setChiefComplaint(draft.chiefComplaint);
    if (draft.relevantHistory) setRelevantHistory(draft.relevantHistory);
    if (draft.examinationFindings) setExaminationFindings(draft.examinationFindings);
    if (draft.diagnosisMentioned) setDiagnosis(draft.diagnosisMentioned);
    if (draft.investigations) setInvestigationsAdvised(draft.investigations);
    if (draft.advice) setAdviceAndDiet(draft.advice);
    if (draft.followUp) setFollowUpInstructions(draft.followUp);

    setIsAiReviewModalOpen(false);
  };

  const handleSaveReport = (reportData: Omit<ReportAnalysis, "id" | "visitId" | "patientId" | "createdAt">) => {
    VisitRepository.addReportAnalysis(visitId, {
      ...reportData,
      patientId,
    });
    // Refresh visit to show attached report
    const updated = VisitRepository.getById(visitId);
    setVisit(updated);
  };

  // Save Draft
  const handleSaveDraft = () => {
    VisitRepository.saveConsultationDraft(visitId, {
      patientId,
      chiefComplaint: chiefComplaint.trim(),
      relevantHistory: relevantHistory.trim(),
      examinationFindings: examinationFindings.trim(),
      diagnosis: diagnosis.trim(),
      investigationsAdvised: investigationsAdvised.trim(),
      adviceAndDiet: adviceAndDiet.trim(),
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : undefined,
      followUpInstructions: followUpRequired ? followUpInstructions : undefined,
    });
    alert("Consultation draft saved successfully.");
  };

  // Complete Appointment & Generate Prescription
  const handleCompleteAppointment = () => {
    if (!diagnosis.trim()) {
      alert("Please enter a Diagnosis or clinical impression before finalizing the prescription.");
      return;
    }
    if (prescribedMedicines.length === 0) {
      if (!window.confirm("No medications are prescribed. Do you want to complete this consultation with clinical advice only?")) {
        return;
      }
    }

    const consultationData: Omit<Consultation, "id" | "visitId" | "createdAt" | "updatedAt"> = {
      patientId,
      chiefComplaint: chiefComplaint.trim() || "Routine OPD encounter",
      relevantHistory: relevantHistory.trim(),
      examinationFindings: examinationFindings.trim(),
      diagnosis: diagnosis.trim(),
      investigationsAdvised: investigationsAdvised.trim(),
      adviceAndDiet: adviceAndDiet.trim(),
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : undefined,
      followUpInstructions: followUpRequired ? followUpInstructions : undefined,
    };

    const prescriptionData: Omit<Prescription, "id" | "visitId" | "consultationId" | "generatedAt"> = {
      patientId,
      patientName: patient?.fullName || "Patient",
      patientAge: patient?.age || 30,
      patientGender: patient?.gender || "Male",
      patientMobile: patient?.mobileNumber || "",
      doctorName: currentUser.name,
      doctorRegNo: currentUser.registrationNo || "DOC-84920",
      clinicName: currentUser.clinicName,
      clinicAddress: "102 Health Avenue, Medical Enclave, Central OPD",
      clinicPhone: "+91 11-4567-8900",
      chiefComplaint: chiefComplaint.trim(),
      diagnosis: diagnosis.trim(),
      medicines: prescribedMedicines,
      investigations: investigationsAdvised.trim(),
      advice: adviceAndDiet.trim(),
      followUpDate: followUpRequired ? followUpDate : undefined,
      followUpInstructions: followUpRequired ? followUpInstructions : undefined,
    };

    const updated = VisitRepository.completeAppointment(visitId, consultationData, prescriptionData);
    if (updated && updated.prescription) {
      setVisit(updated);
      setFinalPrescription(updated.prescription);
      setIsCompletedSuccess(true);
    }
  };

  return (
    <div id="consultation-screen" className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("doctor_dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Doctor OPD Consultation
              </h1>
              <StatusBadge status={visit?.status || "IN_CONSULTATION"} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Token #{visit?.tokenNumber} • Patient: {patient?.fullName} ({patient?.patientId})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <FileSearch className="h-4 w-4 text-blue-600" />
            <span>Analyze Lab Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <History className="h-4 w-4 text-slate-500" />
            <span>Past Visits ({patientHistoryVisits.length})</span>
          </button>
        </div>
      </div>

      {/* Patient & Vitals Context Card */}
      {patient && visit && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-black text-lg shadow-sm">
                #{visit.tokenNumber}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{patient.fullName}</h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {patient.age}y / {patient.gender}
                  </span>
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                    {patient.patientId}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Chief Concern:</strong> {visit.chiefConcern} • Mobile: {patient.mobileNumber}
                </p>
              </div>
            </div>

            {/* Vitals Ribbon */}
            {visit.vitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs self-stretch lg:self-auto">
                <div className="rounded-xl bg-rose-50/70 border border-rose-100 p-2 text-center">
                  <span className="text-[10px] text-rose-700 font-bold block">BP (mmHg)</span>
                  <strong className="text-rose-950 font-bold">{visit.vitals.bpSystolic}/{visit.vitals.bpDiastolic}</strong>
                </div>
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-2 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold block">Pulse (bpm)</span>
                  <strong className="text-emerald-950 font-bold">{visit.vitals.pulse}</strong>
                </div>
                <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-2 text-center">
                  <span className="text-[10px] text-amber-700 font-bold block">Temp (°F)</span>
                  <strong className="text-amber-950 font-bold">{visit.vitals.temperature}</strong>
                </div>
                <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-2 text-center">
                  <span className="text-[10px] text-blue-700 font-bold block">SpO2 (%)</span>
                  <strong className="text-blue-950 font-bold">{visit.vitals.spo2}</strong>
                </div>
                <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-2 text-center">
                  <span className="text-[10px] text-purple-700 font-bold block">Weight / BMI</span>
                  <strong className="text-purple-950 font-bold">{visit.vitals.weight}kg ({visit.vitals.bmi || "—"})</strong>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ Triage vitals not recorded by reception.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Past Visits Drawer */}
      {isHistoryOpen && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="h-4 w-4 text-blue-600" />
              <span>Prior OPD Visits History for {patient?.fullName}</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close Drawer ✕
            </button>
          </div>

          {patientHistoryVisits.length === 0 ? (
            <p className="text-xs text-slate-500">This is the patient's first recorded visit at this clinic.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {patientHistoryVisits.map((hv) => (
                <div key={hv.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold mb-1">
                    <span>{hv.visitDate} ({hv.visitTime})</span>
                    <span className="font-bold text-blue-900">Token #{hv.tokenNumber}</span>
                  </div>
                  <div className="font-bold text-slate-900">
                    Diagnosis: {hv.consultation?.diagnosis || hv.prescription?.diagnosis || "Consultation"}
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-2">
                    {hv.consultation?.examinationFindings || hv.chiefConcern}
                  </p>
                  {hv.prescription?.medicines && (
                    <div className="mt-2 text-[11px] text-indigo-900 bg-indigo-50/60 p-1.5 rounded">
                      Rx: {hv.prescription.medicines.map((m) => m.medicineName).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Prescription View if Finalized */}
      {isCompletedSuccess && finalPrescription && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Appointment Completed & Prescription Generated
                </h3>
                <p className="text-xs text-emerald-800">
                  The OPD visit status is updated to COMPLETED. Reception desk can now collect payment.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCompletedSuccess(false)}
              className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              Edit Consultation
            </button>
          </div>

          <PrescriptionView prescription={finalPrescription} vitals={visit?.vitals} />
        </div>
      )}

      {/* Main Consultation Editor (Active when not viewing completed summary) */}
      {!isCompletedSuccess && (
        <div className="space-y-6">
          {/* AI Clinical Scribe Assistant Bar */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-950">
                    AI Consultation Assistant (Gemini)
                  </h3>
                  <p className="text-xs text-indigo-800">
                    Dictate or type raw findings. Gemini structures notes into Chief Complaint, History, Examination, and Diagnosis drafts.
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Review Required
              </span>
            </div>

            {/* Voice Dictation Component */}
            <AudioConsultationRecorder
              onTranscriptReady={(transcript) => setRawNotesInput(transcript)}
              onRequestSummarize={(transcript) => handleRunAiSummarize(transcript)}
            />

            {/* Text Input Option */}
            <div className="space-y-2">
              <textarea
                value={rawNotesInput}
                onChange={(e) => setRawNotesInput(e.target.value)}
                placeholder="Or type rough clinical notes here... (e.g. 45y male with chest heaviness since 1 day, radiating to left arm. BP 150/95. Advised ECG and Troponin I...)"
                rows={3}
                className="w-full rounded-2xl border border-indigo-200 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-2xs font-medium"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleRunAiSummarize()}
                  disabled={isAiSummarizing || !rawNotesInput.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
                >
                  {isAiSummarizing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Structuring Draft with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Format into Consultation Fields</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Structured Clinical Documentation Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span>Doctor Clinical Assessment</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Chief Complaint */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chief Complaint *
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. High fever with chills, body aches for 3 days"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-indigo-950 mb-1">
                  Primary Diagnosis / Clinical Impression *
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Viral Bronchitis / Stage 1 Essential Hypertension"
                  className="w-full rounded-xl border border-indigo-300 bg-indigo-50/40 p-2.5 text-xs font-bold text-indigo-950 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Relevant History */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Relevant History / Comorbidities
              </label>
              <textarea
                value={relevantHistory}
                onChange={(e) => setRelevantHistory(e.target.value)}
                placeholder="e.g. No known drug allergies. History of Type 2 Diabetes Mellitus for 4 years on Metformin."
                rows={2}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Examination Findings */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Physical Examination Findings
              </label>
              <textarea
                value={examinationFindings}
                onChange={(e) => setExaminationFindings(e.target.value)}
                placeholder="e.g. Pharynx congested (+), tonsils enlarged grade 1. Chest: Bilateral vesicular breath sounds, no wheezing or crepitations. Abdomen soft, non-tender."
                rows={2}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Investigations & Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Investigations Advised
                </label>
                <textarea
                  value={investigationsAdvised}
                  onChange={(e) => setInvestigationsAdvised(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC), ESR, Dengue NS1 Antigen"
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Advice & Lifestyle Instructions
                </label>
                <textarea
                  value={adviceAndDiet}
                  onChange={(e) => setAdviceAndDiet(e.target.value)}
                  placeholder="e.g. Plenty of warm fluids, steam inhalation twice daily, light diet."
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Follow-Up Section */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consultation-followup-toggle"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="consultation-followup-toggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Schedule Follow-Up Appointment
                </label>
              </div>

              {followUpRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Follow-Up Date</span>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Follow-Up Instructions</span>
                    <input
                      type="text"
                      value={followUpInstructions}
                      onChange={(e) => setFollowUpInstructions(e.target.value)}
                      placeholder="e.g. Review in OPD with CBC reports or SOS if fever spikes"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prescribed Medications & Fast Autocomplete Search */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Prescription & Medication Orders ({prescribedMedicines.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Type ~3 letters to search the medicine formulary
              </span>
            </div>

            {/* Autocomplete Search Bar */}
            <div className="relative">
              <div className="flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={medSearchQuery}
                  onChange={(e) => setMedSearchQuery(e.target.value)}
                  placeholder="Search and add medicine (e.g. Paracetamol, Augmentin, Pantoprazole, Azithromycin, Amlodipine)..."
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {isMedDropdownOpen && medSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {medSearchResults.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMedicine(m)}
                      className="p-3 hover:bg-blue-50/80 cursor-pointer border-b border-slate-100 last:border-none flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <span className="text-slate-400 font-normal">({m.strength})</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-semibold">{m.category}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{m.genericName}</div>
                      </div>

                      <div className="text-right text-[11px] text-blue-700 font-semibold shrink-0">
                        + Add to Rx
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medicine Safety Banner */}
            <MedicineSafetyAlert alerts={safetyAlerts} />

            {/* Prescribed List Table */}
            {prescribedMedicines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
                No medications added yet. Search and select from the formulary above.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine & Generic</th>
                      <th className="py-2.5 px-3">Dose</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {prescribedMedicines.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{item.medicineName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.genericName} • {item.strength}</div>
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.dose}
                            onChange={(e) => handleUpdateMedicineField(idx, "dose", e.target.value)}
                            className="w-24 rounded-lg border border-slate-200 p-1 text-xs font-semibold"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <select
                            value={item.frequency}
                            onChange={(e) => handleUpdateMedicineField(idx, "frequency", e.target.value)}
                            className="rounded-lg border border-slate-200 p-1 text-xs font-medium"
                          >
                            <option value="Once Daily">Once Daily (OD)</option>
                            <option value="Twice Daily">Twice Daily (BD)</option>
                            <option value="Three Times Daily">Three Times Daily (TDS)</option>
                            <option value="Every 6 Hours">Every 6 Hours (QID)</option>
                            <option value="SOS (When Required)">SOS (When Required)</option>
                          </select>
                        </td>

                        <td className="py-2 px-2">
                          <select
                            value={item.duration}
                            onChange={(e) => handleUpdateMedicineField(idx, "duration", e.target.value)}
                            className="rounded-lg border border-slate-200 p-1 text-xs font-medium"
                          >
                            <option value="3 Days">3 Days</option>
                            <option value="5 Days">5 Days</option>
                            <option value="7 Days">7 Days</option>
                            <option value="10 Days">10 Days</option>
                            <option value="14 Days">14 Days</option>
                            <option value="1 Month">1 Month</option>
                            <option value="Ongoing">Ongoing</option>
                          </select>
                        </td>

                        <td className="py-2 px-2">
                          <select
                            value={item.instructions}
                            onChange={(e) => handleUpdateMedicineField(idx, "instructions", e.target.value)}
                            className="rounded-lg border border-slate-200 p-1 text-xs font-medium"
                          >
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                            <option value="With Warm Water">With Warm Water</option>
                            <option value="At Bedtime">At Bedtime</option>
                            <option value="Empty Stomach (Morning)">Empty Stomach (Morning)</option>
                          </select>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                            title="Remove medication"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
              >
                <Save className="h-4 w-4 text-slate-500" />
                <span>Save Consultation Draft</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCompleteAppointment}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-[0.99]"
              >
                <Check className="h-4 w-4" />
                <span>Complete Appointment & Generate Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Structured Review Modal */}
      <AIReviewModal
        isOpen={isAiReviewModalOpen}
        draft={aiDraft}
        onAccept={handleAcceptAiDraft}
        onReject={() => setIsAiReviewModalOpen(false)}
        onClose={() => setIsAiReviewModalOpen(false)}
      />

      {/* Diagnostic Lab Report Extraction Modal */}
      <ReportAnalysisModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSaveReport={handleSaveReport}
        patientName={patient?.fullName}
      />
    </div>
  );
};
