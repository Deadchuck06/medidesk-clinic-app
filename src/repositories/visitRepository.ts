import {
  Visit,
  Vitals,
  Consultation,
  Prescription,
  QueueStatus,
  ReportAnalysis,
  Billing
} from "../types";
import { AppStorage } from "../database/storage";
import { PatientRepository } from "./patientRepository";

export class VisitRepository {
  public static getAll(): Visit[] {
    return AppStorage.getVisits();
  }

  public static getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  public static getTodayVisits(): Visit[] {
    const today = this.getTodayDateString();
    const visits = AppStorage.getVisits();
    return visits
      .filter((v) => v.visitDate === today)
      .sort((a, b) => a.tokenNumber - b.tokenNumber);
  }

  public static getById(visitId: string): Visit | null {
    const visits = AppStorage.getVisits();
    return visits.find((v) => v.id === visitId) || null;
  }

  public static createVisit(patientId: string, chiefConcern: string): Visit {
    const visits = AppStorage.getVisits();
    const today = this.getTodayDateString();
    const todayVisits = visits.filter((v) => v.visitDate === today);
    const nextToken = todayVisits.length + 1;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newVisit: Visit = {
      id: `vis_${Date.now()}`,
      patientId,
      tokenNumber: nextToken,
      visitDate: today,
      visitTime: timeStr,
      chiefConcern,
      status: "WAITING",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const updated = [newVisit, ...visits];
    AppStorage.saveVisits(updated);
    return newVisit;
  }

  public static updateVitals(visitId: string, vitalsData: Omit<Vitals, "recordedAt"> & { recordedAt?: string }): Visit | null {
    const visits = AppStorage.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) return null;

    // Calculate BMI if height and weight exist
    let bmi: number | undefined = undefined;
    if (vitalsData.weight > 0 && vitalsData.height > 0) {
      const heightInMeters = vitalsData.height / 100;
      bmi = parseFloat((vitalsData.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    const completeVitals: Vitals = {
      ...vitalsData,
      bmi: bmi || vitalsData.bmi,
      recordedAt: vitalsData.recordedAt || new Date().toISOString(),
    };

    const updatedVisit: Visit = {
      ...visits[index],
      vitals: completeVitals,
      status: visits[index].status === "COMPLETED" ? "COMPLETED" : visits[index].status || "WAITING",
      updatedAt: new Date().toISOString(),
    };

    visits[index] = updatedVisit;
    AppStorage.saveVisits([...visits]);
    return updatedVisit;
  }

  public static updateStatus(visitId: string, status: QueueStatus): Visit | null {
    const visits = AppStorage.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) return null;

    const updatedVisit: Visit = {
      ...visits[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    visits[index] = updatedVisit;
    AppStorage.saveVisits([...visits]);
    return updatedVisit;
  }

  public static saveConsultationDraft(
    visitId: string,
    consultationData: Omit<Consultation, "id" | "visitId" | "createdAt" | "updatedAt">
  ): Visit | null {
    const visits = AppStorage.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) return null;

    const existingCon = visits[index].consultation;
    const consultation: Consultation = {
      ...consultationData,
      id: existingCon?.id || `con_${Date.now()}`,
      visitId,
      status: "DRAFT",
      createdAt: existingCon?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedVisit: Visit = {
      ...visits[index],
      consultation,
      updatedAt: new Date().toISOString(),
    };

    visits[index] = updatedVisit;
    AppStorage.saveVisits([...visits]);
    return updatedVisit;
  }

  public static completeAppointment(
    visitId: string,
    consultationData: Omit<Consultation, "id" | "visitId" | "createdAt" | "updatedAt">,
    prescriptionData: Omit<Prescription, "id" | "visitId" | "consultationId" | "generatedAt">
  ): Visit | null {
    const visits = AppStorage.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) return null;

    const currentVisit = visits[index];
    const patient = PatientRepository.getById(currentVisit.patientId);

    const conId = currentVisit.consultation?.id || `con_${Date.now()}`;
    const fullConsultation: Consultation = {
      ...consultationData,
      id: conId,
      visitId,
      status: "COMPLETED",
      createdAt: currentVisit.consultation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rxId = currentVisit.prescription?.id || `rx_${Date.now()}`;
    const fullPrescription: Prescription = {
      ...prescriptionData,
      id: rxId,
      visitId,
      consultationId: conId,
      patientName: patient?.fullName || prescriptionData.patientName,
      patientAge: patient?.age || prescriptionData.patientAge,
      patientGender: patient?.gender || prescriptionData.patientGender,
      patientMobile: patient?.mobileNumber || prescriptionData.patientMobile,
      generatedAt: new Date().toISOString(),
    };

    // Prepare billing record if not present
    let billing = currentVisit.billing;
    if (!billing) {
      const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      billing = {
        id: `bil_${Date.now()}`,
        visitId,
        patientId: currentVisit.patientId,
        patientName: patient?.fullName || "OPD Patient",
        consultationFee: 500,
        additionalCharges: 0,
        discount: 0,
        total: 500,
        paymentMode: "Cash",
        paymentStatus: "Pending",
        invoiceNumber: invNum,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const updatedVisit: Visit = {
      ...currentVisit,
      status: "COMPLETED",
      consultation: fullConsultation,
      prescription: fullPrescription,
      billing,
      updatedAt: new Date().toISOString(),
    };

    visits[index] = updatedVisit;
    AppStorage.saveVisits([...visits]);
    return updatedVisit;
  }

  public static addReportAnalysis(visitId: string, analysis: Omit<ReportAnalysis, "id" | "visitId" | "createdAt">): Visit | null {
    const visits = AppStorage.getVisits();
    const index = visits.findIndex((v) => v.id === visitId);
    if (index === -1) return null;

    const fullAnalysis: ReportAnalysis = {
      ...analysis,
      id: `rep_${Date.now()}`,
      visitId,
      createdAt: new Date().toISOString(),
    };

    const currentReports = visits[index].reportAnalyses || [];
    const updatedVisit: Visit = {
      ...visits[index],
      reportAnalyses: [fullAnalysis, ...currentReports],
      updatedAt: new Date().toISOString(),
    };

    visits[index] = updatedVisit;
    AppStorage.saveVisits([...visits]);
    return updatedVisit;
  }

  public static getCompletedVisits(): Visit[] {
    const visits = AppStorage.getVisits();
    return visits
      .filter((v) => v.status === "COMPLETED")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getUpcomingFollowUps(): {
    visit: Visit;
    patient: ReturnType<typeof PatientRepository.getById>;
    followUpDate: string;
    instructions: string;
    isOverdue: boolean;
  }[] {
    const visits = AppStorage.getVisits();
    const today = this.getTodayDateString();

    const results: any[] = [];
    visits.forEach((v) => {
      const followUpDate = v.consultation?.followUpDate || v.prescription?.followUpDate;
      const isReq = v.consultation?.followUpRequired || !!v.prescription?.followUpDate;
      if (isReq && followUpDate) {
        const patient = PatientRepository.getById(v.patientId);
        results.push({
          visit: v,
          patient,
          followUpDate,
          instructions: v.consultation?.followUpInstructions || v.prescription?.followUpInstructions || "Review in OPD",
          isOverdue: followUpDate < today,
        });
      }
    });

    return results.sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  }
}
