export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  emailVerified: boolean | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface LoginRequest {
  username: string; // email
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RegisterFormData extends RegisterRequest {
  confirmPassword: string;
}

export interface AuthResponse {
  success: true;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  refreshTokenHash: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}