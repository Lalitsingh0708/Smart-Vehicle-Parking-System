import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const vehicleSchema = z.object({
  registrationNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$|^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/,
      "Please enter a valid Indian registration number (e.g. DL01AB1234 or 22BH1234AA)"
    ),
  vehicleType: z.enum(["motorcycle", "scooter", "electric_scooter", "moped"]),
  make: z.string().trim().min(2, "Make is required").max(50),
  model: z.string().trim().min(1, "Model is required").max(50),
  color: z.string().trim().max(30).optional().or(z.literal("")),
});

export const allocateSlotSchema = z.object({
  parkingLotId: z.string().min(1, "Parking lot ID is required"),
  parkingSlotId: z.string().min(1, "Parking slot ID is required"),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
});

export const checkoutSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const incidentSchema = z.object({
  parkingSessionId: z.string().optional().or(z.literal("")),
  parkingLotId: z.string().optional().or(z.literal("")),
  vehicleId: z.string().optional().or(z.literal("")),
  category: z.enum([
    "theft",
    "damage",
    "unauthorized_parking",
    "blocked_access",
    "helmet_theft",
    "other",
  ]),
  description: z.string().trim().min(10, "Please describe the incident in at least 10 characters").max(2000),
  evidenceUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const incidentResolutionSchema = z.object({
  status: z.enum(["open", "under_review", "resolved", "rejected"]),
  resolutionNotes: z.string().trim().min(5, "Resolution notes must be at least 5 characters").max(2000),
});

export const parkingLotSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100),
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(250),
  city: z.string().trim().min(2, "City is required").max(50),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  description: z.string().trim().max(1000).default(""),
  openingHours: z.string().trim().min(1, "Opening hours required").default("06:00 - 23:00"),
  hourlyRate: z.number().nonnegative("Hourly rate cannot be negative"),
  active: z.boolean().default(true),
});

export const slotSchema = z.object({
  parkingLotId: z.string().min(1, "Parking lot ID is required"),
  zone: z.string().trim().min(1, "Zone is required").max(20),
  slotNumber: z.string().trim().min(1, "Slot number is required").max(20),
  status: z.enum(["available", "occupied", "reserved", "blocked"]).default("available"),
  supportedVehicleTypes: z
    .array(z.enum(["motorcycle", "scooter", "electric_scooter", "moped"]))
    .min(1, "Select at least one vehicle type"),
});
