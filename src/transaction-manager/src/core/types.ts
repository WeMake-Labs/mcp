import { z } from "zod";

// -- Zod Schema for Input Validation --
export const TxnRequestSchema = z.object({
  action: z.enum(["start", "resume", "close"]),
  token: z.string().optional(),
  payload: z.unknown().optional(), // Use unknown for better type safety
  ttlSeconds: z.number().int().positive().optional()
});

// Infer the type from the Zod schema
export type TxnRequestArgs = z.infer<typeof TxnRequestSchema>;

export type TxnAction = "start" | "resume" | "close";

export type TxnResponse = {
  status: "pending" | "complete" | "closed" | "error";
  token: string;
  payload?: unknown;
  expiresAt?: string | null;
  error?: string;
};
