import { randomUUID } from "crypto";

export function generateId(): string {
  return randomUUID();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}