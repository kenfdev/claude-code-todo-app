import { z } from "zod";

export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Task name is required")
    .max(200, "Task name must be less than 200 characters")
    .trim(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;