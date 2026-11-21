import { hashPassword, verifyPassword, generateSessionToken, hashToken, getSessionExpiry } from "@/lib/auth";
import { AuthRepository } from "@/repositories/auth.repository";
import { validateLogin, validateRegister, sanitizeEmail } from "@/validators/auth.validator";

export interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface VerifyResult {
  authenticated: boolean;
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface ProvisionResult {
  success: boolean;
  adminId?: string;
  error?: string;
}

export interface CreateAdminResult {
  success: boolean;
  adminId?: string;
  error?: string;
}

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async login(email: string, password: string): Promise<LoginResult> {
    // Validasi input
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      return { success: false, error: "Email dan password tidak valid" };
    }

    const normalizedEmail = sanitizeEmail(email);

    // Cari admin berdasarkan email
    const admin = await this.repository.findAdminByEmail(normalizedEmail);
    if (!admin || !admin.is_active) {
      // Pesan yang sama untuk email tidak ditemukan atau password salah
      // untuk mencegah email enumeration
      return { success: false, error: "Email atau password salah" };
    }

    // Verifikasi password
    const isPasswordValid = await verifyPassword(password, admin.password_hash);
    if (!isPasswordValid) {
      return { success: false, error: "Email atau password salah" };
    }

    // Buat session token
    const token = generateSessionToken();
    const tokenHash = hashToken(token);
    const expiresAt = getSessionExpiry();

    // Hapus session lama untuk admin ini (satu session aktif per admin)
    await this.repository.deleteAllSessionsForAdmin(admin.id);

    // Simpan session baru
    await this.repository.createSession(admin.id, tokenHash, expiresAt);

    // Update last login
    await this.repository.updateLastLogin(admin.id);

    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async logout(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await this.repository.deleteSession(tokenHash);
  }

  async verify(token: string): Promise<VerifyResult> {
    const tokenHash = hashToken(token);
    const session = await this.repository.findValidSession(tokenHash);

    if (!session) {
      return { authenticated: false };
    }

    const admin = await this.repository.findAdminById(session.admin_id);
    if (!admin || !admin.is_active) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async provisionFirstAdmin(
    name: string,
    email: string,
    password: string
  ): Promise<ProvisionResult> {
    const normalizedEmail = sanitizeEmail(email);

    // Cek apakah sudah ada admin
    const exists = await this.repository.adminExists(normalizedEmail);
    if (exists) {
      return { success: false, error: "Admin dengan email tersebut sudah ada" };
    }

    // Cek apakah ada admin apa pun di sistem
    const adminCount = await this.repository.adminCount();
    if (adminCount > 0) {
      return { success: false, error: "Admin sudah tersedia. Gunakan fitur manajemen admin." };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Buat admin baru
    const id = crypto.randomUUID();
    await this.repository.createAdmin(id, name, normalizedEmail, passwordHash, "super_admin");

    return { success: true, adminId: id };
  }

  async createAdmin(
    name: string,
    email: string,
    password: string,
    role: string = "editor"
  ): Promise<CreateAdminResult> {
    const normalizedEmail = sanitizeEmail(email);

    // Cek apakah sudah ada admin dengan email tersebut
    const exists = await this.repository.adminExists(normalizedEmail);
    if (exists) {
      return { success: false, error: "Admin dengan email tersebut sudah ada" };
    }

    // Validasi role
    const allowedRoles = ["super_admin", "admin", "editor"];
    if (!allowedRoles.includes(role)) {
      return { success: false, error: "Role tidak valid" };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Buat admin baru
    const id = crypto.randomUUID();
    await this.repository.createAdmin(id, name, normalizedEmail, passwordHash, role);

    return { success: true, adminId: id };
  }
}

import crypto from "crypto";
