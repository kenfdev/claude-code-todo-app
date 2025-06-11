import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { users, sessions, passwordResetTokens } from "../../database/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  TokenPayload,
  Session 
} from "../types/auth";

const JWT_SECRET = "your-jwt-secret-key"; // In production, use environment variable
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export class AuthService {
  private db: ReturnType<typeof drizzle>;

  constructor(database: D1Database) {
    this.db = drizzle(database);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAccessToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  generateRefreshToken(): string {
    return nanoid(64);
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  async compareToken(token: string, hash: string): Promise<boolean> {
    return bcrypt.compare(token, hash);
  }

  async register(data: RegisterRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .get();

    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const userId = nanoid();
    const now = new Date().toISOString();

    await this.db.insert(users).values({
      id: userId,
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // Fetch and return the created user
    const user = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      throw new Error("USER_CREATION_FAILED");
    }

    return user;
  }

  async login(data: LoginRequest, userAgent?: string, ipAddress?: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user by email
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.username))
      .get();

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Update last login
    const now = new Date().toISOString();
    await this.db
      .update(users)
      .set({ lastLoginAt: now, updatedAt: now })
      .where(eq(users.id, user.id));

    // Generate tokens
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const refreshToken = this.generateRefreshToken();

    // Create session
    const sessionId = nanoid();
    const tokenHash = await this.hashToken(accessToken);
    const refreshTokenHash = await this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await this.db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      tokenHash,
      refreshTokenHash,
      expiresAt,
      createdAt: now,
      lastUsedAt: now,
      userAgent,
      ipAddress,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: now,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(accessToken: string): Promise<void> {
    const tokenPayload = this.verifyAccessToken(accessToken);
    if (!tokenPayload) {
      return; // Token is invalid, nothing to logout
    }

    const tokenHash = await this.hashToken(accessToken);
    
    // Find and delete session
    await this.db
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash));
  }

  async refreshToken(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Find session by refresh token
    const allSessions = await this.db.select().from(sessions);
    
    let session: Session | null = null;
    for (const s of allSessions) {
      const isMatch = await this.compareToken(refreshTokenValue, s.refreshTokenHash);
      if (isMatch) {
        session = s;
        break;
      }
    }

    if (!session) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await this.db.delete(sessions).where(eq(sessions.id, session.id));
      throw new Error("REFRESH_TOKEN_EXPIRED");
    }

    // Get user
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    const newRefreshToken = this.generateRefreshToken();

    // Update session
    const now = new Date().toISOString();
    const newTokenHash = await this.hashToken(newAccessToken);
    const newRefreshTokenHash = await this.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await this.db
      .update(sessions)
      .set({
        tokenHash: newTokenHash,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        lastUsedAt: now,
      })
      .where(eq(sessions.id, session.id));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async validateSession(accessToken: string): Promise<User | null> {
    const tokenPayload = this.verifyAccessToken(accessToken);
    if (!tokenPayload) {
      return null;
    }

    // Get user
    const user = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(eq(users.id, tokenPayload.userId))
      .get();

    return user || null;
  }

  async createPasswordResetToken(email: string): Promise<string> {
    // Find user
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const tokenHash = await this.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    const now = new Date().toISOString();

    // Delete existing tokens for this user
    await this.db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    // Create new reset token
    await this.db.insert(passwordResetTokens).values({
      id: nanoid(),
      userId: user.id,
      tokenHash,
      expiresAt,
      createdAt: now,
    });

    return resetToken;
  }
}