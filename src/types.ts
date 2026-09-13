export type Role = "RECEPTION" | "DOCTOR";

export type QueueStatus = "WAITING" | "IN_CONSULTATION" | "COMPLETED";

export type PaymentMode = "Cash" | "UPI" | "Card" | "Other";

export type PaymentStatus = "Paid" | "Pending";

export type TabType =
  | "reception_dashboard"
  | "doctor_dashboard"
  | "queue"
  | "add_walkin"
  | "vitals"
  | "consultation"
  | "patients"
  | "patient_profile"
  | "medicines"
  | "completed_visits"
  | "billing"
  | "analytics"
  | "followups";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  clinicName: string;
  doctorSpecialization?: string;
  registrationNo?: string;
}

export interface Patient {
  id: string;
  patientId: string; // e.g., "MED-1001"
  fullName: string;
  mobileNumber: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  chiefConcern: string;
  allergies?: string;
  medicalHistory?: string;
  optionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vitals {
  bpSystolic: number; // mmHg
  bpDiastolic: number; // mmHg
  temperature: number; // °F
  pulse: number; // bpm
  spo2: number; // %
  weight: number; // kg
  height: number; // cm
  bmi?: number;
  optionalNotes?: string;
  notes?: string;
  recordedAt: string;
  recordedBy?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  form: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Ointment" | "Drops";
  recommendedDose?: string;
  defaultDose?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultInstructions?: string;
  maxDoseMgPerDay: number;
  singleMaxDoseMg?: number;
  usageInfo: string;
  category: string;
}

export interface PrescriptionMedicine {
  id?: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  strength: string;
  dose: string;
  frequency: "Once Daily" | "Twice Daily" | "Three Times Daily" | "Every 6 Hours" | "Every 8 Hours" | "As Required" | string;
  duration: string; // e.g. "5 days"
  instructions: "Before Food" | "After Food" | "With Food" | "At Bedtime" | "Empty Stomach" | string;
  customNote?: string;
}

export interface SafetyInteractionRule {
  id: string;
  drugA: string;
  drugB: string;
  genericA: string;
  genericB: string;
  severity: "High" | "Moderate" | "Low";
  description: string;
  mechanism: string;
  clinicalAdvice: string;
}

export interface DosageLimitRule {
  id?: string;
  genericName: string;
  maxSingleDoseMg: number;
  maxDailyDoseMg: number;
  warningMessage: string;
}

export interface Consultation {
  id: string;
  visitId: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  doctorRegNo?: string;
  chiefComplaint: string;
  history?: string;
  relevantHistory?: string;
  examination?: string;
  examinationFindings?: string;
  diagnosis: string;
  investigationsAdvised?: string;
  advice?: string;
  adviceAndDiet?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  followUpInstructions?: string;
  status?: "DRAFT" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  patientId: string;
  consultationId?: string;
  doctorName: string;
  doctorRegNo: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientMobile: string;
  chiefComplaint: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  investigations: string;
  advice: string;
  followUpDate?: string;
  followUpInstructions?: string;
  generatedAt: string;
}

export interface Billing {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  consultationFee: number;
  additionalCharges: number;
  discount: number;
  total: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  invoiceNumber: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportAnalysis {
  id: string;
  visitId: string;
  patientId: string;
  reportTitle: string;
  reportType: string;
  inputContent: string;
  importantFindings: string[];
  abnormalValues: {
    parameter: string;
    value: string;
    referenceRange: string;
    note: string;
  }[];
  observations: string[];
  conciseSummary: string;
  attentionPoints: string[];
  doctorApproved: boolean;
  isSimulated?: boolean;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  tokenNumber: number;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // HH:mm
  chiefConcern: string;
  status: QueueStatus;
  vitals?: Vitals;
  consultation?: Consultation;
  prescription?: Prescription;
  billing?: Billing;
  reportAnalyses?: ReportAnalysis[];
  createdAt: string;
  updatedAt: string;
}

export interface AIDraftConsultation {
  chiefComplaint: string;
  relevantHistory: string;
  examinationFindings: string;
  diagnosisMentioned: string;
  investigations: string;
  advice: string;
  followUp: string;
  isSimulated?: boolean;
}

export interface OPDAnalytics {
  totalPatientsToday: number;
  waitingPatients: number;
  inConsultationPatients: number;
  completedPatients: number;
  totalVisitsAllTime: number;
  totalPatientsOverall: number;
  todayRevenue: number;
  totalRevenueToday: number;
  revenueToday: number;
  totalRevenueOverall: number;
  pendingBillingAmount: number;
  paidBillingCount: number;
  pendingBillingCount: number;
  pendingBillsCount: number;
  averageConsultationTimeMinutes: number;
  topDiagnoses: { diagnosis: string; count: number }[];
  commonDiagnoses: { diagnosis: string; count: number }[];
  hourlyPatientFlow: { hour: string; count: number }[];
  hourlyFootfall: { hour: string; count: number }[];
  paymentModeBreakdown: { mode: string; amount: number; count: number }[];
}
