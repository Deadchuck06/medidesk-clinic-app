import { Patient, Visit } from "../types";
import { AppStorage } from "../database/storage";

export class PatientRepository {
  public static getAll(): Patient[] {
    return AppStorage.getPatients();
  }

  public static getById(id: string): Patient | null {
    const patients = AppStorage.getPatients();
    return patients.find((p) => p.id === id) || null;
  }

  public static findByMobile(mobileNumber: string): Patient | null {
    if (!mobileNumber) return null;
    const cleanMobile = mobileNumber.trim().replace(/\D/g, "");
    const patients = AppStorage.getPatients();
    return (
      patients.find((p) => {
        const pClean = p.mobileNumber.replace(/\D/g, "");
        return pClean === cleanMobile || (cleanMobile.length >= 10 && pClean.endsWith(cleanMobile));
      }) || null
    );
  }

  public static search(query: string): { patient: Patient; matchedVisits: Visit[]; matchReason: string }[] {
    const term = query.trim().toLowerCase();
    if (!term) {
      const allPatients = AppStorage.getPatients();
      const allVisits = AppStorage.getVisits();
      return allPatients.map((patient) => ({
        patient,
        matchedVisits: allVisits.filter((v) => v.patientId === patient.id),
        matchReason: "All records"
      }));
    }

    const patients = AppStorage.getPatients();
    const visits = AppStorage.getVisits();

    const results: { patient: Patient; matchedVisits: Visit[]; matchReason: string }[] = [];

    patients.forEach((patient) => {
      const patientVisits = visits.filter((v) => v.patientId === patient.id);
      let matched = false;
      let reason = "";

      // Check Patient Name
      if (patient.fullName.toLowerCase().includes(term)) {
        matched = true;
        reason = `Name match: "${patient.fullName}"`;
      }
      // Check Mobile Number
      else if (patient.mobileNumber.replace(/\D/g, "").includes(term.replace(/\D/g, ""))) {
        matched = true;
        reason = `Mobile match: ${patient.mobileNumber}`;
      }
      // Check Chief Concern in profile or visits
      else if (
        patient.chiefConcern.toLowerCase().includes(term) ||
        patientVisits.some((v) => v.chiefConcern.toLowerCase().includes(term))
      ) {
        matched = true;
        reason = "Chief Concern match";
      }
      // Check Diagnosis across all historical consultations or prescriptions
      else if (
        patientVisits.some((v) => {
          const diag = v.consultation?.diagnosis || v.prescription?.diagnosis || "";
          return diag.toLowerCase().includes(term);
        })
      ) {
        matched = true;
        const matchedDiagVisit = patientVisits.find((v) => {
          const diag = v.consultation?.diagnosis || v.prescription?.diagnosis || "";
          return diag.toLowerCase().includes(term);
        });
        const d = matchedDiagVisit?.consultation?.diagnosis || matchedDiagVisit?.prescription?.diagnosis;
        reason = `Diagnosis match: "${d}"`;
      }

      if (matched) {
        results.push({
          patient,
          matchedVisits: patientVisits,
          matchReason: reason
        });
      }
    });

    return results;
  }

  public static create(data: Omit<Patient, "id" | "patientId" | "createdAt" | "updatedAt">): Patient {
    const patients = AppStorage.getPatients();
    const nextNum = 1000 + patients.length + 1;
    const patientId = `MED-${nextNum}`;
    const newPatient: Patient = {
      ...data,
      id: `pat_${Date.now()}`,
      patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newPatient, ...patients];
    AppStorage.savePatients(updated);
    return newPatient;
  }

  public static update(id: string, data: Partial<Patient>): Patient | null {
    const patients = AppStorage.getPatients();
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedPatient: Patient = {
      ...patients[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    patients[index] = updatedPatient;
    AppStorage.savePatients([...patients]);
    return updatedPatient;
  }

  public static getPatientHistory(patientId: string): {
    patient: Patient | null;
    visits: Visit[];
  } {
    const patient = this.getById(patientId);
    const allVisits = AppStorage.getVisits();
    const patientVisits = allVisits
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      patient,
      visits: patientVisits
    };
  }
}
