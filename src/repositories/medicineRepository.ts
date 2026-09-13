import {
  Medicine,
  PrescriptionMedicine,
  SafetyInteractionRule,
  DosageLimitRule
} from "../types";
import { AppStorage } from "../database/storage";

export interface DrugSafetyAlert {
  type: "INTERACTION" | "DOSAGE_LIMIT";
  severity: "High" | "Moderate" | "Low";
  title: string;
  message: string;
  drugsInvolved: string[];
  mechanism?: string;
  clinicalAdvice?: string;
  ruleId?: string;
}

export class MedicineRepository {
  public static getAll(): Medicine[] {
    return AppStorage.getMedicines();
  }

  public static search(query: string): Medicine[] {
    const term = query.trim().toLowerCase();
    if (!term) return AppStorage.getMedicines().slice(0, 10);

    const medicines = AppStorage.getMedicines();
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.genericName.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term)
    );
  }

  public static getById(id: string): Medicine | null {
    const medicines = AppStorage.getMedicines();
    return medicines.find((m) => m.id === id) || null;
  }

  public static getSafetyRules(): SafetyInteractionRule[] {
    return AppStorage.getSafetyRules();
  }

  public static getDosageRules(): DosageLimitRule[] {
    return AppStorage.getDosageRules();
  }

  public static checkSafety(prescribedMedicines: PrescriptionMedicine[]): DrugSafetyAlert[] {
    const alerts: DrugSafetyAlert[] = [];
    if (!prescribedMedicines || prescribedMedicines.length === 0) return alerts;

    const safetyRules = AppStorage.getSafetyRules();
    const dosageRules = AppStorage.getDosageRules();

    // 1. Check pairwise drug interactions
    for (let i = 0; i < prescribedMedicines.length; i++) {
      for (let j = i + 1; j < prescribedMedicines.length; j++) {
        const medA = prescribedMedicines[i];
        const medB = prescribedMedicines[j];

        const match = safetyRules.find((rule) => {
          const genA = medA.genericName.toLowerCase();
          const genB = medB.genericName.toLowerCase();
          const nameA = medA.medicineName.toLowerCase();
          const nameB = medB.medicineName.toLowerCase();

          const rGenA = rule.genericA.toLowerCase();
          const rGenB = rule.genericB.toLowerCase();
          const rDrugA = rule.drugA.toLowerCase();
          const rDrugB = rule.drugB.toLowerCase();

          const matchAB =
            (genA.includes(rGenA) || nameA.includes(rDrugA)) &&
            (genB.includes(rGenB) || nameB.includes(rDrugB));

          const matchBA =
            (genA.includes(rGenB) || nameA.includes(rDrugB)) &&
            (genB.includes(rGenA) || nameB.includes(rDrugA));

          return matchAB || matchBA;
        });

        if (match) {
          alerts.push({
            type: "INTERACTION",
            severity: match.severity,
            title: `Potential Interaction: ${medA.medicineName} + ${medB.medicineName}`,
            message: match.description,
            drugsInvolved: [medA.medicineName, medB.medicineName],
            mechanism: match.mechanism,
            clinicalAdvice: match.clinicalAdvice,
            ruleId: match.id,
          });
        }
      }
    }

    // 2. Check dosage limits
    prescribedMedicines.forEach((med) => {
      const matchDosage = dosageRules.find((rule) =>
        med.genericName.toLowerCase().includes(rule.genericName.toLowerCase()) ||
        med.medicineName.toLowerCase().includes(rule.genericName.toLowerCase())
      );

      if (matchDosage) {
        // Extract dosage numbers from strength and frequency
        const strengthMatch = med.strength.match(/(\d+)\s*mg/i);
        const doseMatch = med.dose.match(/(\d+)\s*mg/i) || med.dose.match(/(\d+)\s*tab/i);

        let singleDoseMg = 0;
        if (strengthMatch) {
          singleDoseMg = parseInt(strengthMatch[1], 10);
        }

        // Multiply by frequency
        let timesPerDay = 1;
        if (med.frequency === "Twice Daily") timesPerDay = 2;
        else if (med.frequency === "Three Times Daily") timesPerDay = 3;
        else if (med.frequency === "Every 6 Hours") timesPerDay = 4;
        else if (med.frequency === "Every 8 Hours") timesPerDay = 3;

        const totalDailyMg = singleDoseMg * timesPerDay;

        if (singleDoseMg > matchDosage.maxSingleDoseMg) {
          alerts.push({
            type: "DOSAGE_LIMIT",
            severity: "High",
            title: `Single Dosage Warning: ${med.medicineName}`,
            message: `Entered single dose (${singleDoseMg} mg) exceeds the configured recommended maximum of ${matchDosage.maxSingleDoseMg} mg. Please review.`,
            drugsInvolved: [med.medicineName],
            clinicalAdvice: matchDosage.warningMessage,
          });
        } else if (totalDailyMg > matchDosage.maxDailyDoseMg) {
          alerts.push({
            type: "DOSAGE_LIMIT",
            severity: "High",
            title: `Daily Dosage Warning: ${med.medicineName}`,
            message: `Calculated daily dosage (~${totalDailyMg} mg/day) exceeds the maximum configured limit of ${matchDosage.maxDailyDoseMg} mg/day. Please review.`,
            drugsInvolved: [med.medicineName],
            clinicalAdvice: matchDosage.warningMessage,
          });
        }
      }
    });

    return alerts;
  }
}
