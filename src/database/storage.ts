import {
  Patient,
  Visit,
  Medicine,
  SafetyInteractionRule,
  DosageLimitRule,
  User
} from "../types";
import {
  DEMO_PATIENTS,
  DEMO_VISITS,
  DEMO_MEDICINES,
  DEMO_SAFETY_INTERACTIONS,
  DEMO_DOSAGE_LIMITS,
  DEMO_USERS
} from "../data/seedData";

const STORAGE_KEYS = {
  PATIENTS: "medidesk_patients_v1",
  VISITS: "medidesk_visits_v1",
  MEDICINES: "medidesk_medicines_v1",
  SAFETY_RULES: "medidesk_safety_rules_v1",
  DOSAGE_RULES: "medidesk_dosage_rules_v1",
  CURRENT_USER: "medidesk_current_user_v1",
};

export class AppStorage {
  private static listeners: (() => void)[] = [];

  public static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public static notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error("Storage listener error:", e);
      }
    });
  }

  public static init() {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(DEMO_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(DEMO_VISITS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(DEMO_MEDICINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SAFETY_RULES)) {
      localStorage.setItem(STORAGE_KEYS.SAFETY_RULES, JSON.stringify(DEMO_SAFETY_INTERACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOSAGE_RULES)) {
      localStorage.setItem(STORAGE_KEYS.DOSAGE_RULES, JSON.stringify(DEMO_DOSAGE_LIMITS));
    }
  }

  public static resetToDemoData() {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(DEMO_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(DEMO_VISITS));
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(DEMO_MEDICINES));
    localStorage.setItem(STORAGE_KEYS.SAFETY_RULES, JSON.stringify(DEMO_SAFETY_INTERACTIONS));
    localStorage.setItem(STORAGE_KEYS.DOSAGE_RULES, JSON.stringify(DEMO_DOSAGE_LIMITS));
    this.notify();
  }

  // Patients
  public static getPatients(): Patient[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : DEMO_PATIENTS;
    } catch {
      return DEMO_PATIENTS;
    }
  }

  public static savePatients(patients: Patient[]) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    this.notify();
  }

  // Visits
  public static getVisits(): Visit[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VISITS);
      return data ? JSON.parse(data) : DEMO_VISITS;
    } catch {
      return DEMO_VISITS;
    }
  }

  public static saveVisits(visits: Visit[]) {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
    this.notify();
  }

  // Medicines
  public static getMedicines(): Medicine[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return data ? JSON.parse(data) : DEMO_MEDICINES;
    } catch {
      return DEMO_MEDICINES;
    }
  }

  public static saveMedicines(medicines: Medicine[]) {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    this.notify();
  }

  // Safety Rules
  public static getSafetyRules(): SafetyInteractionRule[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAFETY_RULES);
      return data ? JSON.parse(data) : DEMO_SAFETY_INTERACTIONS;
    } catch {
      return DEMO_SAFETY_INTERACTIONS;
    }
  }

  // Dosage Rules
  public static getDosageRules(): DosageLimitRule[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOSAGE_RULES);
      return data ? JSON.parse(data) : DEMO_DOSAGE_LIMITS;
    } catch {
      return DEMO_DOSAGE_LIMITS;
    }
  }

  // Current User Session
  public static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notify();
  }
}
