import { z } from "zod";
/**
 * Validation schema
 */
export const CreateIconeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  userId: z.string().cuid("Invalid userId"),
   iconUrl: z.string().url("Invalid icon URL"),
});