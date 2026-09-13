import React, { useState, useEffect } from "react";
import { Visit, Patient, User, Billing, PaymentMode, PaymentStatus } from "../types";
import { VisitRepository } from "../repositories/visitRepository";
import { PatientRepository } from "../repositories/patientRepository";
import { BillingRepository } from "../repositories/billingRepository";
import { AppStorage } from "../database/storage";
import { StatusBadge } from "../components/StatusBadge";
import {
  CreditCard,
  CheckCircle2,
  Printer,
  Search,
  DollarSign,
  Receipt,
  ArrowLeft,
  Clock,
  Sparkles,
  Save,
  AlertCircle
} from "lucide-react";

interface BillingScreenProps {
  currentUser: User;
  initialVisitId?: string;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  currentUser,
  initialVisitId,
  onNavigate,
}) => {
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState<string>(initialVisitId || "");
  const [searchQuery, setSearchQuery] = useState("");

  // Form Fields
  const [consultationFee, setConsultationFee] = useState<number>(500);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("Cash");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Paid");
  const [notes, setNotes] = useState<string>("");

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Billing | null>(null);

  const refreshData = () => {
    const visits = VisitRepository.getAll();
    setAllVisits(visits);
    if (!selectedVisitId && visits.length > 0) {
      // Default to first completed visit or first visit
      const completed = visits.find((v) => v.status === "COMPLETED") || visits[0];
      setSelectedVisitId(completed.id);
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = AppStorage.subscribe(refreshData);
    return unsub;
  }, []);

  const selectedVisit = allVisits.find((v) => v.id === selectedVisitId);
  const selectedPatient = selectedVisit ? PatientRepository.getById(selectedVisit.patientId) : null;

  // Load existing billing if present on selected visit
  useEffect(() => {
    if (selectedVisit?.billing) {
      setConsultationFee(selectedVisit.billing.consultationFee);
      setAdditionalCharges(selectedVisit.billing.additionalCharges);
      setDiscount(selectedVisit.billing.discount);
      setPaymentMode(selectedVisit.billing.paymentMode);
      setPaymentStatus(selectedVisit.billing.paymentStatus);
      if (selectedVisit.billing.notes) setNotes(selectedVisit.billing.notes);
      setActiveReceipt(selectedVisit.billing);
    } else {
      setConsultationFee(500);
      setAdditionalCharges(0);
      setDiscount(0);
      setPaymentMode("Cash");
      setPaymentStatus("Paid");
      setNotes("");
      setActiveReceipt(null);
    }
    setSavedSuccess(false);
  }, [selectedVisitId, selectedVisit]);

  // Auto total calculation
  const totalAmount = Math.max(0, (Number(consultationFee) || 0) + (Number(additionalCharges) || 0) - (Number(discount) || 0));

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitId) return;

    const saved = BillingRepository.saveBilling(selectedVisitId, {
      consultationFee,
      additionalCharges,
      discount,
      paymentMode,
      paymentStatus,
      notes: notes.trim() || undefined,
    });

    if (saved) {
      setActiveReceipt(saved);
      setSavedSuccess(true);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredVisits = allVisits.filter((v) => {
    const patient = PatientRepository.getById(v.patientId);
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      patient?.fullName.toLowerCase().includes(q) ||
      patient?.mobileNumber.includes(q) ||
      v.tokenNumber.toString().includes(q)
    );
  });

  return (
    <div id="billing-screen" className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              OPD Billing & Invoicing Desk
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Reception Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Process consultation fees, add procedural charges, issue tax receipts, and record payment modes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visit Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient or token..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden max-h-[600px] overflow-y-auto divide-y divide-slate-100">
            {filteredVisits.map((v) => {
              const patient = PatientRepository.getById(v.patientId);
              const isSelected = v.id === selectedVisitId;
              const hasPaid = v.billing?.paymentStatus === "Paid";

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVisitId(v.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    isSelected ? "bg-blue-50/80 border-l-4 border-blue-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs">
                      #{v.tokenNumber}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{patient?.fullName}</div>
                      <div className="text-[10px] text-slate-500">{v.visitDate} • {v.chiefConcern}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    {v.billing ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasPaid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        ₹{v.billing.total} ({v.billing.paymentStatus})
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Unbilled</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Billing Form & Printable Receipt (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedVisit && selectedPatient ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              {/* Patient Banner */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedPatient.fullName}</h3>
                    <span className="text-xs text-slate-500">({selectedPatient.age}y / {selectedPatient.gender})</span>
                    <StatusBadge status={selectedVisit.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mobile: <strong>{selectedPatient.mobileNumber}</strong> • Token #{selectedVisit.tokenNumber}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono block">Invoice Date</span>
                  <strong className="text-xs text-slate-800">{new Date().toLocaleDateString()}</strong>
                </div>
              </div>

              {savedSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Payment recorded successfully! Invoice generated.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-emerald-700"
                  >
                    <Printer className="h-3 w-3" />
                    Print Receipt
                  </button>
                </div>
              )}

              {/* Billing Form */}
              <form onSubmit={handleSaveBilling} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Consultation Fee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Consultation Fee (₹) *
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  {/* Additional Charges */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Additional Services / ECG (₹)
                    </label>
                    <input
                      type="number"
                      value={additionalCharges}
                      onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-blue-500"
                      min="0"
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Discount / Concession (₹)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                {/* Auto Calculated Total Card */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-100">
                      Total Payable Amount
                    </span>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      Fee (₹{consultationFee}) + Extra (₹{additionalCharges}) - Discount (₹{discount})
                    </p>
                  </div>

                  <div className="text-3xl font-black">
                    ₹{totalAmount}
                  </div>
                </div>

                {/* Payment Mode & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Mode *
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Other">Other / Insurance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Status *
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                    >
                      <option value="Paid">Paid / Settled</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Billing Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receipt Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Paid via UPI Txn ID 84920492"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Generate Invoice</span>
                  </button>
                </div>
              </form>

              {/* Printable Cash Receipt Document */}
              {activeReceipt && (
                <div
                  id="invoice-receipt-print"
                  className="rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-xs space-y-4 print:p-0 print:border-none"
                >
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{currentUser.clinicName}</h4>
                      <p className="text-[11px] text-slate-500">Official Outpatient Billing Receipt</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <strong className="text-blue-900">{activeReceipt.invoiceNumber}</strong>
                      <div className="text-slate-500">{new Date(activeReceipt.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-xs gap-2">
                    <div>Patient: <strong>{activeReceipt.patientName}</strong></div>
                    <div className="text-right">Mode: <strong>{activeReceipt.paymentMode}</strong></div>
                  </div>

                  <table className="w-full text-xs text-left border-y border-slate-200">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-600">Consultation Charges</td>
                        <td className="py-2 text-right font-bold">₹{activeReceipt.consultationFee}</td>
                      </tr>
                      {activeReceipt.additionalCharges > 0 && (
                        <tr className="border-b border-slate-100">
                          <td className="py-2 text-slate-600">Additional Services</td>
                          <td className="py-2 text-right font-bold">₹{activeReceipt.additionalCharges}</td>
                        </tr>
                      )}
                      {activeReceipt.discount > 0 && (
                        <tr className="border-b border-slate-100">
                          <td className="py-2 text-slate-600">Concession / Discount</td>
                          <td className="py-2 text-right font-bold text-emerald-700">-₹{activeReceipt.discount}</td>
                        </tr>
                      )}
                      <tr className="font-black text-sm">
                        <td className="py-2.5 text-slate-900">Total Net Amount</td>
                        <td className="py-2.5 text-right text-emerald-800">₹{activeReceipt.total}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                    <span>Status: <strong className="text-emerald-700">{activeReceipt.paymentStatus}</strong></span>
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="print:hidden inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print Tax Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <Receipt className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-800">Select a visit from the left column</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
