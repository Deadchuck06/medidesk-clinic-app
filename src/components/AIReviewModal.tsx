import React, { useState } from "react";
import { AIDraftConsultation } from "../types";
import { Sparkles, Check, X, Edit3, AlertCircle } from "lucide-react";

interface AIReviewModalProps {
  isOpen: boolean;
  draft: AIDraftConsultation | null;
  onAccept: (editedDraft: AIDraftConsultation) => void;
  onReject: () => void;
  onClose: () => void;
}

export const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  draft,
  onAccept,
  onReject,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState<AIDraftConsultation | null>(draft);

  // Sync state when draft prop changes
  React.useEffect(() => {
    setEditedDraft(draft);
    setIsEditing(false);
  }, [draft]);

  if (!isOpen || !editedDraft) return null;

  const handleFieldChange = (field: keyof AIDraftConsultation, val: string) => {
    setEditedDraft((prev) => (prev ? { ...prev, [field]: val } : null));
  };

  const handleAccept = () => {
    if (editedDraft) {
      onAccept(editedDraft);
    }
  };

  return (
    <div
      id="ai-review-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="ai-review-modal"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-indigo-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Sparkles className="h-6 w-6 text-indigo-100" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Consultation Assistant</h3>
              <p className="text-xs text-indigo-100/90">
                Structured OPD encounter draft generated via Gemini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mandatory Medical Safety Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="font-semibold">
            AI Generated Draft – Review Required.
          </span>
          <span className="text-amber-800">
            Please verify, edit, or reject before accepting into the official medical consultation.
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Structured Clinical Sections
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditing ? "Done Editing" : "Edit Fields Before Accepting"}
            </button>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chief Complaint
            </label>
            {isEditing ? (
              <textarea
                value={editedDraft.chiefComplaint}
                onChange={(e) => handleFieldChange("chiefComplaint", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-slate-800 leading-relaxed font-medium">
                {editedDraft.chiefComplaint || "None specified"}
              </div>
            )}
          </div>

          {/* Relevant History */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Relevant History
            </label>
            {isEditing ? (
              <textarea
                value={editedDraft.relevantHistory}
                onChange={(e) => handleFieldChange("relevantHistory", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-slate-800 leading-relaxed">
                {editedDraft.relevantHistory || "None recorded"}
              </div>
            )}
          </div>

          {/* Examination Findings */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Examination Findings
            </label>
            {isEditing ? (
              <textarea
                value={editedDraft.examinationFindings}
                onChange={(e) => handleFieldChange("examinationFindings", e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-slate-800 leading-relaxed">
                {editedDraft.examinationFindings || "None recorded"}
              </div>
            )}
          </div>

          {/* Diagnosis Mentioned */}
          <div>
            <label className="block text-xs font-bold text-indigo-950 mb-1">
              Diagnosis Mentioned / Suspected
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedDraft.diagnosisMentioned}
                onChange={(e) => handleFieldChange("diagnosisMentioned", e.target.value)}
                className="w-full rounded-lg border border-indigo-300 p-2.5 text-sm font-semibold text-indigo-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="rounded-lg bg-indigo-50/70 border border-indigo-200 p-3 text-indigo-950 font-semibold">
                {editedDraft.diagnosisMentioned || "Clinical impression requiring doctor confirmation"}
              </div>
            )}
          </div>

          {/* Two-Column Grid for Investigations & Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Investigations Advised
              </label>
              {isEditing ? (
                <textarea
                  value={editedDraft.investigations}
                  onChange={(e) => handleFieldChange("investigations", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              ) : (
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-slate-800 text-xs leading-relaxed min-h-[50px]">
                  {editedDraft.investigations || "None"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Advice & Lifestyle
              </label>
              {isEditing ? (
                <textarea
                  value={editedDraft.advice}
                  onChange={(e) => handleFieldChange("advice", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              ) : (
                <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-slate-800 text-xs leading-relaxed min-h-[50px]">
                  {editedDraft.advice || "None"}
                </div>
              )}
            </div>
          </div>

          {/* Follow-Up */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Follow-Up Instructions
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedDraft.followUp}
                onChange={(e) => handleFieldChange("followUp", e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            ) : (
              <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-slate-800 text-xs">
                {editedDraft.followUp || "As required / Routine OPD follow-up"}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs"
          >
            <X className="h-4 w-4 text-rose-600" />
            Reject Draft
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isEditing ? "Finish Editing" : "Edit Fields"}
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm"
            >
              <Check className="h-4 w-4" />
              Accept Into Consultation Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
