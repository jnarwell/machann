/**
 * Validation Module
 *
 * Provides Zod schemas and utilities for validating API inputs.
 *
 * Usage:
 * ```typescript
 * import { createTradeSchema, safeValidate, validationErrorResponse } from "@/lib/validation";
 *
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const result = safeValidate(createTradeSchema, body);
 *
 *   if (!result.success) {
 *     return validationErrorResponse(result.error);
 *   }
 *
 *   // result.data is typed and validated
 *   const trade = await createTrade(result.data);
 * }
 * ```
 */

export {
  // Constants
  TRANSPORT_MODES,
  ROAD_CONDITIONS,
  WEATHER_CONDITIONS,
  QUALITY_LEVELS,
  REGIONS,
  COMMODITIES,
  // Shared schemas
  priceSchema,
  quantitySchema,
  numericStringSchema,
  transportCostSchema,
  // Trade schemas
  createTradeSchema,
  updateTradeSchema,
  getTradesQuerySchema,
  // Supplier schemas
  createSupplierSchema,
  updateSupplierRatingSchema,
  // Message schemas
  createMessageSchema,
  getMessagesQuerySchema,
  // Price report schemas
  createPriceReportSchema,
  getPriceReportsQuerySchema,
  // Utilities
  safeValidate,
  formatZodError,
  validationErrorResponse,
} from "./schemas";

// Type exports
export type {
  CreateTradeInput,
  UpdateTradeInput,
  CreateSupplierInput,
  UpdateSupplierRatingInput,
  CreateMessageInput,
  CreatePriceReportInput,
} from "./schemas";
