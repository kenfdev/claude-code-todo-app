export function generateId(): string {
  return crypto.randomUUID();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}