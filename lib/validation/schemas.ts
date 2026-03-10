import { z } from "zod";

// ============================================================================
// CONSTANTS - Allowed values for enum fields
// ============================================================================

export const TRANSPORT_MODES = ["tap-tap", "moto", "kamyon", "pye", "bato"] as const;
export const ROAD_CONDITIONS = ["bon", "pasab", "move", "bloke"] as const;
export const WEATHER_CONDITIONS = ["soley", "lapli", "inondasyon", "van_fo"] as const;
export const QUALITY_LEVELS = ["bon", "mwayen", "fèb"] as const;
export const REGIONS = [
  "potoprens",
  "atibonit",
  "no",
  "sid",
  "sant",
  "nodwes",
  "ges",
  "nippes",
  "grandans",
  "sides",
] as const;

export const COMMODITIES = [
  "diri-kole",
  "mayi",
  "pwa-nwa",
  "pwason",
  "bannann",
  "lwil-palma",
  "gaz",
] as const;

// ============================================================================
// SHARED SCHEMAS - Reusable validation patterns
// ============================================================================

/** Positive number with reasonable bounds for prices (0 < x <= 1,000,000 HTG) */
export const priceSchema = z
  .number("Price must be a number")
  .positive("Price must be positive")
  .max(1_000_000, "Price cannot exceed 1,000,000 HTG");

/** Positive number for quantities (0 < x <= 10,000) */
export const quantitySchema = z
  .number("Quantity must be a number")
  .positive("Quantity must be positive")
  .max(10_000, "Quantity cannot exceed 10,000");

/** String that accepts number input and parses it */
export const numericStringSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) throw new Error("Invalid number");
    return num;
  });

/** Optional transport cost (0 <= x <= 50,000 HTG) */
export const transportCostSchema = z
  .number()
  .min(0, "Transport cost cannot be negative")
  .max(50_000, "Transport cost cannot exceed 50,000 HTG");

// ============================================================================
// TRADE SCHEMAS
// ============================================================================

/** Schema for creating a new trade */
export const createTradeSchema = z.object({
  commodityId: z
    .string("Commodity ID is required")
    .min(1, "Commodity ID cannot be empty"),

  qty: numericStringSchema.pipe(quantitySchema),

  unit: z.string().default("kg"),

  supplierId: z.string().optional(),

  supplierName: z.string().max(100, "Supplier name too long").optional(),

  marketBought: z
    .string("Market bought is required")
    .min(1, "Market bought cannot be empty")
    .max(100, "Market name too long"),

  pricePaid: numericStringSchema.pipe(priceSchema),

  marketSold: z
    .string("Market sold is required")
    .min(1, "Market sold cannot be empty")
    .max(100, "Market name too long"),

  priceReceived: numericStringSchema.pipe(priceSchema),

  notes: z.string().max(500, "Notes too long").optional(),

  date: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : new Date())),

  // Transport fields
  transportCostHtg: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === null || val === undefined || val === "") return null;
      const num = typeof val === "string" ? parseFloat(val) : val;
      if (isNaN(num)) return null;
      return num;
    })
    .pipe(transportCostSchema.nullable())
    .optional()
    .nullable(),

  transportMode: z.enum(TRANSPORT_MODES, "Invalid transport mode").optional().nullable(),

  roadCondition: z.enum(ROAD_CONDITIONS, "Invalid road condition").optional().nullable(),

  weatherCondition: z.enum(WEATHER_CONDITIONS, "Invalid weather condition").optional().nullable(),
});

/** Schema for updating an existing trade */
export const updateTradeSchema = createTradeSchema.extend({
  id: z.string("Trade ID is required").min(1),
});

/** Schema for GET /api/trades query params */
export const getTradesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().min(0)),
  commodityId: z.string().optional(),
  includeTransport: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// ============================================================================
// SUPPLIER SCHEMAS
// ============================================================================

/** Schema for creating a new supplier */
export const createSupplierSchema = z.object({
  name: z
    .string("Name is required")
    .min(1, "Name cannot be empty")
    .max(100, "Name too long"),

  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{7,20}$/, "Invalid phone number format")
    .optional()
    .nullable(),

  location: z
    .string("Location is required")
    .min(1, "Location cannot be empty")
    .max(100, "Location too long"),

  commodities: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val.join(",") : val || ""))
    .optional(),

  notes: z.string().max(500, "Notes too long").optional(),
});

/** Schema for updating supplier rating */
export const updateSupplierRatingSchema = z.object({
  supplierId: z
    .string("Supplier ID is required")
    .min(1, "Supplier ID cannot be empty"),

  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
});

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

/** Schema for creating a new message */
export const createMessageSchema = z.object({
  content: z
    .string("Message content is required")
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long (max 1000 characters)"),

  solGroupId: z.string().optional(),
});

/** Schema for GET /api/messages query params */
export const getMessagesQuerySchema = z.object({
  solGroupId: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().min(1).max(100)),
  after: z.string().datetime({ offset: true }).optional(),
});

/** Schema for GET /api/price-reports query params */
export const getPriceReportsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().min(0)),
  commodityId: z.string().optional(),
  regionId: z.string().optional(),
  market: z.string().max(100).optional(),
  userId: z.string().optional(),
  allUsers: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// ============================================================================
// PRICE REPORT SCHEMAS
// ============================================================================

/** Schema for submitting a price report */
export const createPriceReportSchema = z.object({
  commodityId: z.enum(COMMODITIES, "Invalid commodity"),

  price: numericStringSchema.pipe(priceSchema),

  region: z.enum(REGIONS, "Invalid region"),

  market: z.string().min(1).max(100).optional(),

  quality: z.enum(QUALITY_LEVELS, "Invalid quality level").optional(),

  notes: z.string().max(500, "Notes too long").optional(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely parse and validate data against a schema.
 * Returns { success: true, data } or { success: false, error }
 */
export function safeValidate<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod errors into a user-friendly message
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((e) => {
      const path = e.path.length > 0 ? `${e.path.join(".")}: ` : "";
      return `${path}${e.message}`;
    })
    .join("; ");
}

/**
 * Create a NextResponse for validation errors
 */
export function validationErrorResponse(error: z.ZodError) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { NextResponse } = require("next/server");
  return NextResponse.json(
    {
      success: false,
      error: formatZodError(error),
      code: "VALIDATION_ERROR",
      details: error.issues,
    },
    { status: 400 }
  );
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierRatingInput = z.infer<typeof updateSupplierRatingSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreatePriceReportInput = z.infer<typeof createPriceReportSchema>;
