import React, { useState } from "react";
import { Medicine } from "../types";
import { MedicineRepository } from "../repositories/medicineRepository";
import {
  Pill,
  Search,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Info,
  Scale,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export const MedicineMasterScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"FORMULARY" | "INTERACTIONS" | "DOSAGE_LIMITS">("FORMULARY");

  const allMedicines = MedicineRepository.getAll();
  const safetyRules = MedicineRepository.getSafetyRules();
  const dosageRules = MedicineRepository.getDosageRules();

  const filteredMedicines = allMedicines.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  return (
    <div id="medicine-master-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Clinic Medicine Master & Safety Engine
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {allMedicines.length} Formulary Drugs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated OPD formulary, rule-based drug-drug interaction checker, and safe dosage ceilings.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("FORMULARY")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "FORMULARY"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Pill className="h-4 w-4" />
          <span>Medicine Formulary ({allMedicines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("INTERACTIONS")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "INTERACTIONS"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Interaction Matrix ({safetyRules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DOSAGE_LIMITS")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "DOSAGE_LIMITS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Dosage Ceilings ({dosageRules.length})</span>
        </button>
      </div>

      {/* Tab 1: Formulary List */}
      {activeTab === "FORMULARY" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine brand name, generic formula, or therapeutic category..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Medicine Brand</th>
                    <th className="py-3 px-4">Generic Composition</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Strength</th>
                    <th className="py-3 px-4">Standard Dose & Frequency</th>
                    <th className="py-3 px-4">Standard Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredMedicines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{m.name}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{m.genericName}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          {m.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{m.strength}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {m.defaultDose || m.recommendedDose || "1 Tablet"} • {m.defaultFrequency || "Twice Daily"} ({m.defaultDuration || "5 Days"})
                      </td>
                      <td className="py-3 px-4 text-blue-900 font-medium">{m.defaultInstructions || "After Food"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interaction Rules */}
      {activeTab === "INTERACTIONS" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
            <h3 className="font-bold text-amber-950 flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>Rule-Based Drug Interaction Engine</span>
            </h3>
            <p className="leading-relaxed">
              MediDesk cross-checks every pair of prescribed medicines against this curated clinical database in real-time. When a collision is identified, an alert is rendered with recommended actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-2xl border border-amber-200 bg-white p-4 text-xs shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                      {rule.severity} Severity Collision
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {rule.drugA} + {rule.drugB}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ({rule.genericA} + {rule.genericB})
                    </p>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed font-medium">{rule.description}</p>

                {rule.mechanism && (
                  <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
                    <strong className="text-slate-800">Mechanism:</strong> {rule.mechanism}
                  </div>
                )}

                {rule.clinicalAdvice && (
                  <div className="rounded-lg bg-blue-50/60 p-2 text-blue-950 font-medium">
                    <strong className="text-blue-900">Clinical Advice:</strong> {rule.clinicalAdvice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Safe Dosage Ceilings */}
      {activeTab === "DOSAGE_LIMITS" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-xs text-indigo-900">
            <h3 className="font-bold text-indigo-950 flex items-center gap-2 mb-1">
              <Scale className="h-4 w-4 text-indigo-600" />
              <span>Standard Safe Dosage Ceiling Limits</span>
            </h3>
            <p className="leading-relaxed">
              Preset threshold guidelines prevent accidental overdose inputs during rapid typing in high-volume OPD clinics.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Generic Molecule</th>
                  <th className="py-3 px-4">Max Single Dose</th>
                  <th className="py-3 px-4">Max Daily Ceiling</th>
                  <th className="py-3 px-4">Safety Warning Advisory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dosageRules.map((rule, dIdx) => (
                  <tr key={rule.id || `rule_${dIdx}`} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{rule.genericName}</td>
                    <td className="py-3 px-4 font-bold text-rose-700">{rule.maxSingleDoseMg} mg</td>
                    <td className="py-3 px-4 font-bold text-rose-800">{rule.maxDailyDoseMg} mg / day</td>
                    <td className="py-3 px-4 text-slate-700 leading-relaxed">{rule.warningMessage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
