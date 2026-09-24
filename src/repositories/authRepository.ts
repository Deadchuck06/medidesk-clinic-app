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
      return null;
    }

    return user;
  }

  public static login(
    email: string,
    password?: string,
    role?: Role
  ): {
    success: boolean;
    user?: User;
    message?: string;
  } {

    // Check empty email
    if (!email || !email.trim()) {
      return {
        success: false,
        message: "Email address is required.",
      };
    }

    // Check empty password
    if (!password || !password.trim()) {
      return {
        success: false,
        message: "Password is required.",
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Demo credentials for MediDesk prototype
    const credentials = [
      {
        email: "reception@medidesk.clinic",
        password: "Reception@123",
        role: "RECEPTION" as Role,
      },
      {
        email: "doctor.shukla@medidesk.clinic",
        password: "Doctor@123",
        role: "DOCTOR" as Role,
      },
    ];

    // Email + password + selected role must all match
    const validCredential = credentials.find(
      (credential) =>
        credential.email === cleanEmail &&
        credential.password === password &&
        (!role || credential.role === role)
    );

    if (!validCredential) {
      return {
        success: false,
        message: "Invalid email, password, or selected role.",
      };
    }

    // Find corresponding user profile
    const matchedUser = DEMO_USERS.find(
      (user) =>
        user.email.toLowerCase() === validCredential.email &&
        user.role === validCredential.role
    );

    if (!matchedUser) {
      return {
        success: false,
        message: "User account could not be found.",
      };
    }

    // Store logged-in user
    AppStorage.setCurrentUser(matchedUser);

    return {
      success: true,
      user: matchedUser,
    };
  }

  public static logout() {
    AppStorage.setCurrentUser(null);
  }

  public static switchRole(): User {
    const current = this.getCurrentUser();

    const newRole: Role =
      current?.role === "DOCTOR"
        ? "RECEPTION"
        : "DOCTOR";

    const targetDemo = DEMO_USERS.find(
      (user) => user.role === newRole
    );

    if (!targetDemo) {
      throw new Error(
        `Demo user for role ${newRole} could not be found.`
      );
    }

    AppStorage.setCurrentUser(targetDemo);

    return targetDemo;
  }
}