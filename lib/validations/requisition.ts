import { z } from "zod";

export const requisitionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  department: z
    .string()
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department must be less than 100 characters"),
  purpose: z
    .string()
    .min(10, "Purpose must be at least 10 characters")
    .max(500, "Purpose must be less than 500 characters"),
  requestedDate: z.string().min(1, "Date is required"),
  requestedTime: z.string().min(1, "Time is required"),
  numberOfPassengers: z
    .number()
    .min(1, "Number of passengers must be at least 1")
    .max(50, "Number of passengers cannot exceed 50"),
  userId: z.string().optional(), // Optional user ID for when specified
});

export type RequisitionFormData = z.infer<typeof requisitionSchema>;
