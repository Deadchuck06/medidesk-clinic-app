import { User, Role } from "../types";
import { DEMO_USERS } from "../data/seedData";
import { AppStorage } from "../database/storage";

export class AuthRepository {
  public static getDemoUsers(): User[] {
    return DEMO_USERS;
  }

  public static getCurrentUser(): User | null {
    const user = AppStorage.getCurrentUser();
    if (!user) {
      // Default to Doctor for fast demonstration if not logged out, but can be configured
      return null;
    }
    return user;
  }

  public static login(email: string, password?: string, role?: Role): { success: boolean; user?: User; message?: string } {
    if (!email || !email.trim()) {
      return { success: false, message: "Email address is required." };
    }
    if (!password || !password.trim()) {
      return { success: false, message: "Password is required." };
    }

    // In this academic field prototype, validate credentials against demo roster or role match
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail || (role && u.role === role)
    );

    if (matchedUser) {
      // Ensure if a role was explicitly chosen, we use the correct persona
      const finalUser = role ? DEMO_USERS.find((u) => u.role === role) || matchedUser : matchedUser;
      AppStorage.setCurrentUser(finalUser);
      return { success: true, user: finalUser };
    }

    // Dynamic user creation if customized for field testing
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      role: role || "RECEPTION",
      clinicName: "CityCare Family Clinic & OPD Center",
      doctorSpecialization: role === "DOCTOR" ? "MBBS (General Practitioner)" : undefined,
      registrationNo: role === "DOCTOR" ? `DOC-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
    };

    AppStorage.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  public static logout() {
    AppStorage.setCurrentUser(null);
  }

  public static switchRole(): User {
    const current = this.getCurrentUser();
    const newRole: Role = current?.role === "DOCTOR" ? "RECEPTION" : "DOCTOR";
    const targetDemo = DEMO_USERS.find((u) => u.role === newRole) || {
      id: `usr_${newRole.toLowerCase()}`,
      name: newRole === "DOCTOR" ? "Dr. Rajesh Sharma" : "Pooja Verma",
      email: newRole === "DOCTOR" ? "doctor@medidesk.clinic" : "reception@medidesk.clinic",
      role: newRole,
      clinicName: "CityCare Family Clinic & OPD Center",
      doctorSpecialization: newRole === "DOCTOR" ? "MBBS, MD (Internal Medicine)" : undefined,
      registrationNo: newRole === "DOCTOR" ? "MCI-48291" : undefined,
    };
    AppStorage.setCurrentUser(targetDemo);
    return targetDemo;
  }
}
