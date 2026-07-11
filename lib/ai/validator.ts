import { z } from "zod";

export const MasterWorkerPlanSchema = z.object({
  platforms: z.array(z.string()).min(1),
  tone: z.string().optional(),
  length: z.string().optional(),
  globalContextAnchor: z.string().optional(),
  highRisk: z.boolean().default(false),
  estimatedTokens: z.number().optional(),
});

export type MasterWorkerPlan = z.infer<typeof MasterWorkerPlanSchema>;

export class StrictSchemaValidator {
  public static validatePlan(jsonStr: string): MasterWorkerPlan {
    try {
      const parsed = JSON.parse(jsonStr);
      const validated = MasterWorkerPlanSchema.parse(parsed);
      return validated;
    } catch (e: any) {
      console.error("[StrictSchemaValidator Error]:", e);
      throw new Error(`Master blueprint validation failed: ${e.message}`);
    }
  }
}
