import React, { useState, useEffect } from "react";
import { Patient, Visit, User } from "../types";
import { PatientRepository } from "../repositories/patientRepository";
import { VisitRepository } from "../repositories/visitRepository";
import {
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  History,
  Phone,
  User as UserIcon,
  MapPin,
  FileText
} from "lucide-react";

interface AddWalkInScreenProps {
  currentUser?: User;
  initialMobile?: string;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const AddWalkInScreen: React.FC<AddWalkInScreenProps> = ({
  currentUser,
  initialMobile,
  onNavigate,
}) => {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [mobileNumber, setMobileNumber] = useState(initialMobile || "");
  const [address, setAddress] = useState("");
  const [chiefConcern, setChiefConcern] = useState("");

  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const [existingVisits, setExistingVisits] = useState<Visit[]>([]);
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live duplicate checking on mobile number change
  useEffect(() => {
    const cleanMobile = mobileNumber.trim().replace(/\D/g, "");
    if (cleanMobile.length >= 10) {
      const match = PatientRepository.findByMobile(cleanMobile);
      if (match) {
        setExistingPatient(match);
        const hist = PatientRepository.getPatientHistory(match.id);
        setExistingVisits(hist.visits);
        // Pre-fill details if blank
        if (!fullName) setFullName(match.fullName);
        if (!age) setAge(match.age.toString());
        if (!address && match.address) setAddress(match.address);
        setGender(match.gender);
      } else {
        setExistingPatient(null);
        setExistingVisits([]);
      }
      setDuplicateChecked(true);
    } else {
      setExistingPatient(null);
      setExistingVisits([]);
      setDuplicateChecked(false);
    }
  }, [mobileNumber]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!fullName.trim()) {
      setError("Patient Full Name is required.");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 125) {
      setError("Please enter a valid age (1 - 125).");
      return;
    }
    const cleanMob = mobileNumber.trim().replace(/\D/g, "");
    if (!cleanMob || cleanMob.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!chiefConcern.trim()) {
      setError("Chief Concern / reason for visit is required.");
      return;
    }

    let patientIdToUse: string;

    if (existingPatient) {
      // Use existing patient
      patientIdToUse = existingPatient.id;
      // Update any updated address or details if changed
      PatientRepository.update(existingPatient.id, {
        address: address || existingPatient.address,
        age: ageNum,
      });
    } else {
      // Create new patient
      const newPat = PatientRepository.create({
        fullName: fullName.trim(),
        age: ageNum,
        gender,
        mobileNumber: cleanMob,
        address: address.trim() || undefined,
        chiefConcern: chiefConcern.trim(),
      });
      patientIdToUse = newPat.id;
    }

    // Create Today's Visit
    const newVisit = VisitRepository.createVisit(patientIdToUse, chiefConcern.trim());

    // Prompt Reception to go straight to Vitals or back to Queue
    onNavigate("vitals", { visitId: newVisit.id, patientId: patientIdToUse });
  };

  return (
    <div id="add-walkin-screen" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("reception_dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Walk-In Patient Registration
            </h1>
            <p className="text-xs text-slate-500">
              Register new arrivals, check previous visit records, and issue an OPD Queue Token.
            </p>
          </div>
        </div>
      </div>

      {/* Duplicate / Returning Patient Notice Banner */}
      {existingPatient && (
        <div
          id="returning-patient-banner"
          className="rounded-2xl border border-blue-200 bg-blue-50/90 p-5 shadow-xs animate-in fade-in"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <History className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded-md">
                    Returning Patient Recognized
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-800">
                    ID: {existingPatient.patientId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {existingPatient.fullName} • {existingPatient.age}y / {existingPatient.gender}
                </h3>
                <p className="text-xs text-slate-700 mt-0.5">
                  Mobile: {existingPatient.mobileNumber} {existingPatient.address ? `• ${existingPatient.address}` : ""}
                </p>
                <p className="text-xs text-blue-900 mt-1 font-medium">
                  {existingVisits.length} previous visit(s) on record. Submitting this form will create a new OPD token for this existing patient record without creating a duplicate.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("patient_profile", { patientId: existingPatient.id })}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 shadow-2xs"
            >
              <span>View Past History</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleRegister} className="space-y-6">
          {/* Step 1: Mobile Number for Lookup */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. Mobile Number (Primary Patient Identifier) *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                id="walkin-mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Enter 10-digit mobile number. MediDesk will instantly check for returning patient records.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              2. Patient Demographics & Profile
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="walkin-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    id="walkin-age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 34"
                    min="1"
                    max="125"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gender *
                  </label>
                  <select
                    id="walkin-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Address / City (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  id="walkin-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector 14, Urban Estate, Gurgaon"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Chief Concern */}
          <div className="border-t border-slate-100 pt-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Today's Chief Concern / Symptoms *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute top-3 left-3 text-slate-400">
                <FileText className="h-4 w-4" />
              </div>
              <textarea
                id="walkin-concern"
                value={chiefConcern}
                onChange={(e) => setChiefConcern(e.target.value)}
                placeholder="e.g. High fever with chills since 2 days, headache, mild throat irritation"
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate("reception_dashboard")}
              className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="walkin-submit-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.99]"
            >
              <UserPlus className="h-4 w-4" />
              <span>{existingPatient ? "Issue Token for Existing Patient" : "Register & Issue Token"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
