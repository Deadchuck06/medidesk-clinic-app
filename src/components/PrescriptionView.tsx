import React from "react";
import { Prescription, Vitals } from "../types";
import { Printer, Download, Share2, Copy, Check, FileText, Pill } from "lucide-react";

interface PrescriptionViewProps {
  prescription: Prescription;
  vitals?: Vitals;
  onClose?: () => void;
}

export const PrescriptionView: React.FC<PrescriptionViewProps> = ({
  prescription,
  vitals,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const medList = prescription.medicines
      .map(
        (m, idx) =>
          `${idx + 1}. ${m.medicineName} (${m.strength}) - ${m.dose} - ${m.frequency} for ${m.duration} [${m.instructions}]`
      )
      .join("\n");

    const text = `
========================================
${prescription.clinicName}
${prescription.clinicAddress} | Tel: ${prescription.clinicPhone}
Doctor: ${prescription.doctorName} (Reg: ${prescription.doctorRegNo})
========================================
PATIENT: ${prescription.patientName} | Age: ${prescription.patientAge}y | Gender: ${prescription.patientGender}
DATE: ${new Date(prescription.generatedAt).toLocaleDateString()}
DIAGNOSIS: ${prescription.diagnosis}
CHIEF COMPLAINT: ${prescription.chiefComplaint}

Rx - MEDICATIONS:
${medList}

INVESTIGATIONS: ${prescription.investigations || "None"}
ADVICE: ${prescription.advice || "Adequate rest and hydration"}
FOLLOW-UP: ${prescription.followUpDate ? `Review on ${prescription.followUpDate} (${prescription.followUpInstructions || "In OPD"})` : "As required"}
========================================
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const jsonStr = JSON.stringify(prescription, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Prescription_${prescription.patientName.replace(/\s+/g, "_")}_${prescription.generatedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden bg-slate-100 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>Official OPD Digital Prescription</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Prescription</span>
          </button>
        </div>
      </div>

      {/* Printable Prescription Document */}
      <div
        id="prescription-printable-area"
        className="rounded-2xl border-2 border-slate-300 bg-white p-8 shadow-md print:p-0 print:border-none print:shadow-none text-slate-900 font-sans"
      >
        {/* Letterhead Header */}
        <div className="border-b-2 border-blue-900 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 text-white font-black text-sm">
                  MD
                </div>
                <h1 className="text-xl font-black tracking-tight text-blue-950 uppercase">
                  {prescription.clinicName}
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">{prescription.clinicAddress}</p>
              <p className="text-xs text-slate-600 font-medium">Contact: {prescription.clinicPhone}</p>
            </div>

            <div className="text-right">
              <h2 className="text-base font-bold text-slate-900">{prescription.doctorName}</h2>
              <p className="text-xs text-slate-700 font-medium">MBBS, MD (General Medicine)</p>
              <p className="text-xs text-slate-500 font-mono">Reg No: {prescription.doctorRegNo}</p>
              <p className="text-xs text-blue-800 font-semibold mt-0.5">Consultant Physician</p>
            </div>
          </div>
        </div>

        {/* Patient Bar */}
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="text-slate-500 block">Patient Name:</span>
            <strong className="text-slate-900 text-sm">{prescription.patientName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Age / Gender:</span>
            <strong className="text-slate-900">{prescription.patientAge} Years / {prescription.patientGender}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Mobile:</span>
            <strong className="text-slate-900">{prescription.patientMobile || "—"}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Date & Time:</span>
            <strong className="text-slate-900">
              {new Date(prescription.generatedAt).toLocaleDateString()} {new Date(prescription.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </strong>
          </div>
        </div>

        {/* Vitals summary if present */}
        {vitals && (
          <div className="mt-2.5 px-3 py-1.5 rounded-md bg-blue-50/50 border border-blue-100 text-[11px] text-slate-700 flex flex-wrap gap-4 items-center">
            <span><strong>Vitals:</strong></span>
            <span>BP: <strong>{vitals.bpSystolic}/{vitals.bpDiastolic} mmHg</strong></span>
            <span>Pulse: <strong>{vitals.pulse} bpm</strong></span>
            <span>Temp: <strong>{vitals.temperature}°F</strong></span>
            <span>SpO2: <strong>{vitals.spo2}%</strong></span>
            <span>Weight: <strong>{vitals.weight} kg</strong></span>
            {vitals.bmi && <span>BMI: <strong>{vitals.bmi}</strong></span>}
          </div>
        )}

        {/* Clinical Notes */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Chief Complaint</span>
            <p className="font-semibold text-slate-900 mt-0.5">{prescription.chiefComplaint || "Routine consultation"}</p>
          </div>
          <div>
            <span className="text-blue-900 font-bold uppercase tracking-wider text-[10px]">Diagnosis</span>
            <p className="font-bold text-blue-950 text-sm mt-0.5">{prescription.diagnosis || "Under Evaluation"}</p>
          </div>
        </div>

        {/* Prescription Symbol & Medicines Table */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="font-serif font-black text-2xl text-blue-900">℞</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Prescribed Medications</span>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dose & Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {prescription.medicines.map((med, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Pill className="h-3 w-3 text-blue-600" />
                        <span>{med.medicineName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{med.genericName} • {med.strength}</div>
                      {med.customNote && (
                        <div className="text-[10px] text-indigo-700 font-medium italic mt-0.5">Note: {med.customNote}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{med.dose}</span>
                      <div className="text-[11px] text-slate-600 font-medium">{med.frequency}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{med.duration}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block rounded-sm bg-blue-50 px-2 py-0.5 font-semibold text-blue-800 text-[11px]">
                        {med.instructions}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Clinical Directives */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {prescription.investigations && (
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                Investigations Advised
              </span>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed">{prescription.investigations}</p>
            </div>
          )}

          {prescription.advice && (
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                General Advice & Diet
              </span>
              <p className="text-slate-800 whitespace-pre-line leading-relaxed">{prescription.advice}</p>
            </div>
          )}
        </div>

        {/* Follow Up & Doctor Signature */}
        <div className="mt-8 pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-end justify-between gap-6">
          <div className="text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-0.5">
              Next Follow-Up
            </span>
            {prescription.followUpDate ? (
              <p className="text-slate-900 font-bold text-sm">
                {prescription.followUpDate} ({prescription.followUpInstructions || "Review in OPD"})
              </p>
            ) : (
              <p className="text-slate-600">Review as required or if symptoms persist.</p>
            )}
          </div>

          <div className="text-right">
            <div className="font-serif italic font-bold text-slate-800 text-base mb-1">
              {prescription.doctorName}
            </div>
            <div className="h-0.5 w-40 bg-slate-400 ml-auto" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Authorized Medical Practitioner
            </p>
            <p className="text-[9px] text-slate-400">Generated securely via MediDesk OPD</p>
          </div>
        </div>
      </div>
    </div>
  );
};
