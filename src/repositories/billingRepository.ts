import { Billing, PaymentMode, PaymentStatus } from "../types";
import { AppStorage } from "../database/storage";
import { PatientRepository } from "./patientRepository";

export class BillingRepository {
  public static getAll(): Billing[] {
    const visits = AppStorage.getVisits();
    const billings: Billing[] = [];
    visits.forEach((v) => {
      if (v.billing) {
        billings.push(v.billing);
      }
    });
    return billings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getByVisitId(visitId: string): Billing | null {
    const visits = AppStorage.getVisits();
    const visit = visits.find((v) => v.id === visitId);
    return visit?.billing || null;
  }

  public static saveBilling(
    visitId: string,
    billingData: {
      consultationFee: number;
      additionalCharges: number;
      discount: number;
      paymentMode: PaymentMode;
      paymentStatus: PaymentStatus;
      notes?: string;
    }
  ): Billing | null {
    const visits = AppStorage.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) return null;

    const currentVisit = visits[index];
    const patient = PatientRepository.getById(currentVisit.patientId);

    const fee = Number(billingData.consultationFee) || 0;
    const additional = Number(billingData.additionalCharges) || 0;
    const discount = Number(billingData.discount) || 0;
    const total = Math.max(0, fee + additional - discount);

    const existingBilling = currentVisit.billing;
    const invoiceNum =
      existingBilling?.invoiceNumber ||
      `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const billing: Billing = {
      id: existingBilling?.id || `bil_${Date.now()}`,
      visitId,
      patientId: currentVisit.patientId,
      patientName: patient?.fullName || "OPD Patient",
      consultationFee: fee,
      additionalCharges: additional,
      discount: discount,
      total: total,
      paymentMode: billingData.paymentMode,
      paymentStatus: billingData.paymentStatus,
      invoiceNumber: invoiceNum,
      paymentDate: billingData.paymentStatus === "Paid" ? new Date().toISOString() : undefined,
      notes: billingData.notes,
      createdAt: existingBilling?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    visits[index] = {
      ...currentVisit,
      billing,
      updatedAt: new Date().toISOString(),
    };

    AppStorage.saveVisits([...visits]);
    return billing;
  }
}
