
import { z } from 'zod';

export const createRfpSchema = z.object({
  title: z.string(),
  description: z.string(),
  requirements: z.string(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  deadline: z.iso.datetime(),
  notes: z.string().optional(),
});

export type CreateRfpData = z.infer<typeof createRfpSchema>;

export const submitResponseSchema = z.object({
  proposed_budget: z.number().optional(),
  timeline: z.string().optional(),
  cover_letter: z.string().optional(),
});

export type SubmitResponseData = z.infer<typeof submitResponseSchema>

export const updateRFPStatusSchema = z.object({
  status: z.string(),
});

export const getRfpResponsesSchema = z.object({
    rfp_id: z.string(),
});

export const reviewResponseSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
});
