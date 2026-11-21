export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateLogin(input: LoginInput): LoginValidationResult {
  const errors: Record<string, string> = {};

  if (!input.email || typeof input.email !== "string") {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Format email tidak valid";
  }

  if (!input.password || typeof input.password !== "string") {
    errors.password = "Password wajib diisi";
  } else if (input.password.length < 8) {
    errors.password = "Password minimal 8 karakter";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateRegister(input: RegisterInput): RegisterValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || typeof input.name !== "string") {
    errors.name = "Nama wajib diisi";
  } else if (input.name.trim().length < 2) {
    errors.name = "Nama minimal 2 karakter";
  }

  if (!input.email || typeof input.email !== "string") {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Format email tidak valid";
  }

  if (!input.password || typeof input.password !== "string") {
    errors.password = "Password wajib diisi";
  } else if (input.password.length < 8) {
    errors.password = "Password minimal 8 karakter";
  }

  const allowedRoles = ["super_admin", "admin", "editor"];
  if (input.role && !allowedRoles.includes(input.role)) {
    errors.role = "Role tidak valid";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
