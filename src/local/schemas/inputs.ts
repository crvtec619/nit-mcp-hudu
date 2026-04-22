import { z } from "zod";

// ---- Magic Dash ----

export const createMagicDashSchema = z.object({
  company_id: z.coerce
    .number()
    .int()
    .positive()
    .describe(
      "Company ID to attach the Magic Dash widget to. On local-dev this must match HUDU_TEST_COMPANY_ID."
    ),
  title: z
    .string()
    .min(1)
    .max(200)
    .describe(
      "Widget title. Hudu upserts by (title, company_id) — reusing a title updates the existing widget."
    ),
  message: z
    .string()
    .min(1)
    .max(5000)
    .describe("Widget body. Plain text or HTML."),
  shade: z
    .enum(["success", "info", "warning", "danger"])
    .optional()
    .describe("Color shade. Defaults to Hudu's own default if omitted."),
  icon: z
    .string()
    .max(100)
    .optional()
    .describe("Font Awesome icon name (e.g. 'fas fa-sticky-note')."),
  content_link: z
    .string()
    .url()
    .max(1000)
    .optional()
    .describe("Optional link the widget title points to."),
  content: z
    .string()
    .max(50000)
    .optional()
    .describe(
      "Optional expanded HTML body shown when the widget is opened. Distinct from 'message' (the summary line)."
    ),
  image_url: z
    .string()
    .url()
    .max(1000)
    .optional()
    .describe("Optional image URL displayed on the widget (e.g. a logo or screenshot)."),
});

export const deleteMagicDashSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .describe("Magic Dash ID returned by a prior create call."),
  company_id: z.coerce
    .number()
    .int()
    .positive()
    .describe("Company ID the widget belongs to (used for sandbox enforcement)."),
});

// ---- Articles (KB) ----

export const createArticleSchema = z.object({
  company_id: z.coerce
    .number()
    .int()
    .positive()
    .describe(
      "Company ID to attach the article to. On local-dev this must match HUDU_TEST_COMPANY_ID."
    ),
  name: z.string().min(1).max(200).describe("Article title."),
  content: z
    .string()
    .min(1)
    .max(100000)
    .describe("Article body. HTML is accepted."),
  enable_sharing: z
    .boolean()
    .default(false)
    .describe("If true, Hudu generates a public share URL."),
  folder_id: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe("Optional Hudu folder ID to file the article under."),
});

export const updateArticleSchema = z.object({
  id: z.coerce.number().int().positive().describe("Article ID to update."),
  company_id: z.coerce
    .number()
    .int()
    .positive()
    .describe(
      "Company ID the article belongs to. On local-dev this must match HUDU_TEST_COMPANY_ID."
    ),
  name: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(100000).optional(),
  enable_sharing: z.boolean().optional(),
  folder_id: z.coerce.number().int().positive().optional(),
});

export const articleIdSchema = z.object({
  id: z.coerce.number().int().positive().describe("Article ID."),
  company_id: z.coerce
    .number()
    .int()
    .positive()
    .describe("Company ID the article belongs to (used for sandbox enforcement)."),
});
