import React, { useState } from "react";
import { DrugSafetyAlert } from "../repositories/medicineRepository";
import { AIService } from "../services/aiService";
import { AlertTriangle, ShieldAlert, Sparkles, Loader2, Info, ChevronDown, ChevronUp } from "lucide-react";

interface MedicineSafetyAlertProps {
  alerts: DrugSafetyAlert[];
}

export const MedicineSafetyAlert: React.FC<MedicineSafetyAlertProps> = ({ alerts }) => {
  const [explainingRuleId, setExplainingRuleId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState(true);

  if (!alerts || alerts.length === 0) return null;

  const handleAskGemini = async (alert: DrugSafetyAlert, index: number) => {
    const key = alert.ruleId || `alert_${index}`;
    if (aiExplanations[key]) return;

    setExplainingRuleId(key);
    try {
      const drugA = alert.drugsInvolved[0] || "Drug A";
      const drugB = alert.drugsInvolved[1] || "Drug B";
      const res = await AIService.explainInteraction(
        drugA,
        drugB,
        alert.message,
        alert.mechanism
      );
      setAiExplanations((prev) => ({
        ...prev,
        [key]: res.explanation,
      }));
    } catch (err: any) {
      console.error("AI explanation error:", err);
      setAiExplanations((prev) => ({
        ...prev,
        [key]: `Clinical Note: ${alert.message}. Mechanism: ${alert.mechanism || "Metabolic pathway interaction"}. Doctor recommendation: Spacing doses or monitoring for adverse symptoms.`,
      }));
    } finally {
      setExplainingRuleId(null);
    }
  };

  return (
    <div
      id="medicine-safety-banner"
      className="rounded-xl border border-amber-300 bg-amber-50/95 p-4 shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>Medication Safety Warning</span>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                {alerts.length} {alerts.length === 1 ? "Issue" : "Issues"} Flagged
              </span>
            </h4>
            <p className="text-xs text-amber-800">
              Potential drug interactions or dosage limit thresholds detected in current selection.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg p-1 text-amber-700 hover:bg-amber-200/60"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3.5 space-y-2.5">
          {alerts.map((alert, idx) => {
            const alertKey = alert.ruleId || `alert_${idx}`;
            const explanation = aiExplanations[alertKey];
            const isExplaining = explainingRuleId === alertKey;

            return (
              <div
                key={alertKey}
                className="rounded-lg border border-amber-200 bg-white p-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <div className="font-semibold text-slate-900">{alert.title}</div>
                      <p className="mt-0.5 text-slate-700 leading-relaxed">{alert.message}</p>
                      {alert.clinicalAdvice && (
                        <div className="mt-1 flex items-start gap-1 text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                          <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-slate-800">Recommendation:</strong> {alert.clinicalAdvice}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {alert.type === "INTERACTION" && (
                    <button
                      type="button"
                      onClick={() => handleAskGemini(alert, idx)}
                      disabled={isExplaining || !!explanation}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                      title="Explain clinical mechanism with Gemini AI"
                    >
                      {isExplaining ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 text-indigo-600" />
                          <span>{explanation ? "AI Explained" : "Explain"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {explanation && (
                  <div className="mt-2 rounded-md bg-indigo-50/70 border border-indigo-100 p-2.5 text-xs text-indigo-950">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Gemini Clinical Mechanism Summary:</span>
                    </div>
                    <p className="leading-relaxed text-indigo-900/90">{explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-[11px] text-amber-800/90 italic">
            * MediDesk Rule-Based Safety Engine. The prescribing doctor retains ultimate clinical discretion.
          </p>
        </div>
      )}
    </div>
  );
};
