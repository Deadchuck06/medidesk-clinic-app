import React, { useState, useEffect } from "react";
import { Visit, Patient, Vitals } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Scale,
  Ruler,
  Calculator,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";

interface VitalsScreenProps {
  visitId: string;
  patientId: string;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const VitalsScreen: React.FC<VitalsScreenProps> = ({
  visitId,
  patientId,
  onNavigate,
}) => {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  // Form states
  const [bpSystolic, setBpSystolic] = useState<string>("120");
  const [bpDiastolic, setBpDiastolic] = useState<string>("80");
  const [temperature, setTemperature] = useState<string>("98.6");
  const [pulse, setPulse] = useState<string>("72");
  const [spo2, setSpo2] = useState<string>("98");
  const [weight, setWeight] = useState<string>("68");
  const [height, setHeight] = useState<string>("172");
  const [notes, setNotes] = useState<string>("");

  const [bmi, setBmi] = useState<number | null>(23.0);
  const [bmiCategory, setBmiCategory] = useState<string>("Normal weight");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const v = VisitRepository.getById(visitId);
    const p = PatientRepository.getById(patientId);
    setVisit(v);
    setPatient(p);

    if (v?.vitals) {
      setBpSystolic(v.vitals.bpSystolic.toString());
      setBpDiastolic(v.vitals.bpDiastolic.toString());
      setTemperature(v.vitals.temperature.toString());
      setPulse(v.vitals.pulse.toString());
      setSpo2(v.vitals.spo2.toString());
      setWeight(v.vitals.weight.toString());
      setHeight(v.vitals.height.toString());
      if (v.vitals.optionalNotes || v.vitals.notes) {
        setNotes(v.vitals.optionalNotes || v.vitals.notes || "");
      }
    }
  }, [visitId, patientId]);

  // Live BMI calculation
  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      const heightInM = h / 100;
      const calculatedBmi = parseFloat((w / (heightInM * heightInM)).toFixed(1));
      setBmi(calculatedBmi);

      if (calculatedBmi < 18.5) {
        setBmiCategory("Underweight");
      } else if (calculatedBmi < 24.9) {
        setBmiCategory("Normal weight");
      } else if (calculatedBmi < 29.9) {
        setBmiCategory("Overweight");
      } else {
        setBmiCategory("Obese");
      }
    } else {
      setBmi(null);
      setBmiCategory("—");
    }
  }, [weight, height]);

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sys = parseInt(bpSystolic, 10);
    const dia = parseInt(bpDiastolic, 10);
    const temp = parseFloat(temperature);
    const pul = parseInt(pulse, 10);
    const ox = parseInt(spo2, 10);
    const wt = parseFloat(weight);
    const ht = parseFloat(height);

    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) {
      setError("Please enter valid Blood Pressure readings.");
      return;
    }
    if (isNaN(temp) || temp < 90 || temp > 110) {
      setError("Please enter valid Body Temperature (90°F - 110°F).");
      return;
    }
    if (isNaN(pul) || pul < 30 || pul > 220) {
      setError("Please enter valid Pulse rate.");
      return;
    }
    if (isNaN(ox) || ox < 50 || ox > 100) {
      setError("Please enter valid SpO2 percentage (50% - 100%).");
      return;
    }

    const vitalsData: Omit<Vitals, "recordedAt"> = {
      bpSystolic: sys,
      bpDiastolic: dia,
      temperature: temp,
      pulse: pul,
      spo2: ox,
      weight: isNaN(wt) ? 0 : wt,
      height: isNaN(ht) ? 0 : ht,
      bmi: bmi || undefined,
      notes: notes.trim() || undefined,
    };

    VisitRepository.updateVitals(visitId, vitalsData);
    setSavedSuccess(true);

    setTimeout(() => {
      onNavigate("queue");
    }, 800);
  };

  return (
    <div id="vitals-screen" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("queue")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Record Patient Vitals
            </h1>
            <p className="text-xs text-slate-500">
              Enter triage clinical parameters for today's OPD consultation.
            </p>
          </div>
        </div>
      </div>

      {/* Patient Context Banner */}
      {patient && visit && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-base shadow-sm">
                #{visit.tokenNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {patient.fullName}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    ({patient.age}y / {patient.gender})
                  </span>
                  <span className="text-xs font-mono font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    {patient.patientId}
                  </span>
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  <strong>Chief Concern:</strong> {visit.chiefConcern}
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>Mobile: <strong className="text-slate-800">{patient.mobileNumber}</strong></div>
              <div>Arrival: <strong className="text-slate-800">{visit.visitTime}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>Vitals saved successfully! Redirecting to Today's Queue...</span>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSaveVitals} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Blood Pressure */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>Blood Pressure *</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">mmHg</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Systolic</span>
                  <input
                    type="number"
                    id="vitals-bp-sys"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    placeholder="120"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Diastolic</span>
                  <input
                    type="number"
                    id="vitals-bp-dia"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    placeholder="80"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pulse Rate */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span>Pulse Rate *</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">bpm</span>
              </div>
              <input
                type="number"
                id="vitals-pulse"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-3"
                required
              />
            </div>

            {/* Temperature */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-amber-500" />
                  <span>Temperature *</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">°Fahrenheit</span>
              </div>
              <input
                type="number"
                step="0.1"
                id="vitals-temp"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="98.6"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-3"
                required
              />
            </div>

            {/* SpO2 Oxygen */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <span>SpO2 (Oxygen) *</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">%</span>
              </div>
              <input
                type="number"
                id="vitals-spo2"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                min="50"
                max="100"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-3"
                required
              />
            </div>

            {/* Weight */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-indigo-500" />
                  <span>Body Weight</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Kilograms (kg)</span>
              </div>
              <input
                type="number"
                step="0.1"
                id="vitals-weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="68"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-3"
              />
            </div>

            {/* Height */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Ruler className="h-4 w-4 text-purple-500" />
                  <span>Height</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-400">Centimeters (cm)</span>
              </div>
              <input
                type="number"
                id="vitals-height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="172"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mt-3"
              />
            </div>
          </div>

          {/* Auto Calculated BMI Card */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  Auto Calculated Body Mass Index (BMI)
                </span>
                <p className="text-xs text-indigo-800/90 mt-0.5">
                  Derived from entered height and weight metrics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-950">
                  {bmi ? `${bmi} kg/m²` : "—"}
                </div>
                <div className="text-xs font-bold text-indigo-700">
                  {bmiCategory}
                </div>
              </div>
            </div>
          </div>

          {/* Triage / Reception Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Additional Triage / Reception Observations (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient appeared flushed and shivering. BP taken in seated position."
              rows={2}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate("queue")}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Skip / Cancel
            </button>

            <button
              type="submit"
              id="save-vitals-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.99]"
            >
              <Save className="h-4 w-4" />
              <span>Save Vitals & Place in Queue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
