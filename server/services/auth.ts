import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "prompt2book-jwt-secret";
const SALT_ROUNDS = 10;

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare a password with a hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate a JWT token
export function generateAuthToken(userId: number, username: string): string {
  return jwt.sign(
    {
      id: userId,
      username
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

// Verify a JWT token
export function verifyAuthToken(token: string): { id: number; username: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Generate a password reset token
export function generatePasswordResetToken(userId: number, email: string): string {
  return jwt.sign(
    {
      id: userId,
      email,
      purpose: "password-reset"
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Verify a password reset token
export function verifyPasswordResetToken(token: string): { id: number; email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: number; 
      email: string; 
      purpose: string;
    };
    
    if (decoded.purpose !== "password-reset") {
      throw new Error("Invalid token purpose");
    }
    
    return { id: decoded.id, email: decoded.email };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
