import React, { useState } from "react";
import { ReportAnalysis } from "../types";
import { AIService } from "../services/aiService";
import { FileText, Sparkles, Upload, AlertTriangle, CheckCircle2, X, Loader2, Save, FileImage, ShieldCheck } from "lucide-react";

interface ReportAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReport?: (report: Omit<ReportAnalysis, "id" | "visitId" | "patientId" | "createdAt">) => void;
  patientName?: string;
}

export const ReportAnalysisModal: React.FC<ReportAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSaveReport,
  patientName = "Patient",
}) => {
  const [reportTitle, setReportTitle] = useState("Complete Blood Count (CBC) & Biochemistry");
  const [reportType, setReportType] = useState("Laboratory Report");
  const [reportText, setReportText] = useState("");

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AIService.analyzeReport(
        reportText,
        reportType,
        imageBase64 || undefined,
        imageMimeType
      );
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      console.error("Report analysis failed:", err);
      setError(err.message || "Failed to analyze medical report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToVisit = () => {
    if (!analysisResult || !onSaveReport) return;

    onSaveReport({
      reportTitle,
      reportType,
      inputContent: reportText || imageFileName || "Uploaded report file",
      importantFindings: analysisResult.importantFindings || [],
      abnormalValues: analysisResult.abnormalValues || [],
      observations: analysisResult.observations || [],
      conciseSummary: analysisResult.conciseSummary || "",
      attentionPoints: analysisResult.attentionPoints || [],
      doctorApproved: true,
    });
    onClose();
  };

  return (
    <div
      id="report-analysis-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="report-analysis-modal"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <FileText className="h-6 w-6 text-blue-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Diagnostic & Lab Report Analyzer</h3>
              <p className="text-xs text-blue-200">
                Outpatient clinical document extraction powered by Gemini 3.7 Flash
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clinical Disclaimer */}
        <div className="bg-blue-50 border-b border-blue-200/80 px-6 py-2.5 flex items-center gap-2 text-xs text-blue-900">
          <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            <strong>Clinical Safety Notice:</strong> AI-generated summary for clinical decision assistance only. Final diagnostic interpretation must be performed by the attending doctor.
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!analysisResult ? (
            /* Input View */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Report Title / Category
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g., CBC & ESR Profile / Ultrasound Abdomen"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Laboratory Report">Laboratory (Biochemistry/Hematology)</option>
                    <option value="Radiology (X-Ray / USG / MRI)">Radiology (X-Ray / USG / CT)</option>
                    <option value="Microbiology / Pathology">Microbiology / Culture</option>
                    <option value="Prior Prescription / Discharge Summary">Prior Prescription / Discharge Summary</option>
                  </select>
                </div>
              </div>

              {/* Paste Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Report Content / Numerical Values
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Paste raw text or type key parameters
                  </span>
                </div>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  rows={8}
                  className="w-full font-mono text-xs rounded-lg border border-slate-300 p-3 leading-relaxed focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Optional Document Upload */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                <input
                  type="file"
                  id="report-file-upload"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="report-file-upload"
                  className="cursor-pointer inline-flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-blue-700 hover:underline">
                    {imageFileName ? `Selected: ${imageFileName}` : "Upload report photo or scan (Optional)"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Supports JPG, PNG, or mobile camera snapshots
                  </span>
                </label>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{reportTitle}</h4>
                  <p className="text-xs text-slate-500">Analyzed for {patientName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalysisResult(null)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Analyze Another Report
                </button>
              </div>

              {/* Concise Summary */}
              <div className="rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200 p-4">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-sm mb-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Clinical Synopsis</span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed">
                  {analysisResult.conciseSummary}
                </p>
              </div>

              {/* Abnormal Values Table */}
              {analysisResult.abnormalValues && analysisResult.abnormalValues.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Flagged Abnormal Values ({analysisResult.abnormalValues.length})</span>
                  </h5>
                  <div className="overflow-hidden rounded-lg border border-rose-200 shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-rose-50/80 text-rose-900 border-b border-rose-200 font-bold">
                        <tr>
                          <th className="py-2 px-3">Parameter</th>
                          <th className="py-2 px-3">Observed Value</th>
                          <th className="py-2 px-3">Reference Range</th>
                          <th className="py-2 px-3">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 bg-white">
                        {analysisResult.abnormalValues.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-rose-50/40">
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.parameter}</td>
                            <td className="py-2 px-3 font-bold text-rose-700">{item.value}</td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{item.referenceRange}</td>
                            <td className="py-2 px-3 text-slate-700">{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Important Findings & Observations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
                  <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Important Findings</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4 leading-relaxed">
                    {analysisResult.importantFindings?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5">
                  <h5 className="text-xs font-bold text-amber-950 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>Points for Doctor Attention</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-amber-900 list-disc pl-4 leading-relaxed">
                    {analysisResult.attentionPoints?.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>

          {!analysisResult ? (
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isLoading || (!reportText && !imageBase64)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Gemini Analyzing Report...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Extract Clinical Findings</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveToVisit}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <Save className="h-4 w-4" />
              Approve & Save Report to Visit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
