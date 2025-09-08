import { z } from "zod";

export const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .max(20, "Registration number must be less than 20 characters")
    .trim(),
  busName: z
    .string()
    .min(2, "Bus name must be at least 2 characters")
    .max(50, "Bus name must be less than 50 characters")
    .trim(),
  type: z.enum(["BUS", "MINIBUS"], {
    required_error: "Vehicle type is required",
  }),
  capacity: z
    .number()
    .min(1, "Capacity must be at least 1")
    .max(100, "Capacity cannot exceed 100"),
  driver: z.string().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
