import { z } from "zod";

// ---- Companies ----

export const listCompaniesSchema = z.object({
  search: z.string().optional().describe("Search companies by keyword (fuzzy match across name and other fields). Use this for partial/natural-language lookups like 'Viking'."),
  name: z.string().optional().describe("Filter companies by exact name match. For partial lookups, use 'search' instead."),
  phone: z.string().optional().describe("Filter by phone number"),
  website: z.string().optional().describe("Filter by website URL"),
  city: z.string().optional().describe("Filter by city"),
  state: z.string().optional().describe("Filter by state"),
  slug: z.string().optional().describe("Filter by URL slug"),
  id_number: z.string().optional().describe("Filter by company id_number"),
  id_in_integration: z.string().optional().describe("Filter by external integration ID (PSA/RMM identifier)"),
  updated_at: z.string().optional().describe("Filter companies updated within a range or at an exact time (ISO format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getCompanySchema = z.object({
  company_id: z.coerce.number().int().positive().describe("The ID of the company to retrieve"),
});

// ---- Assets ----

export const listAssetsSchema = z.object({
  search: z.string().optional().describe("Search assets by keyword (fuzzy match). Use this for partial/natural-language lookups. Only works with the global /assets endpoint (not company-scoped)."),
  company_id: z.coerce.number().int().positive().optional().describe("Filter assets by company ID. If set, uses the company-scoped endpoint (which has limited filtering)."),
  name: z.string().optional().describe("Filter assets by exact name. For partial lookups, use 'search' instead. Only works with global /assets endpoint."),
  primary_serial: z.string().optional().describe("Filter assets by primary serial number. Only works with global /assets endpoint."),
  asset_layout_id: z.coerce.number().int().positive().optional().describe("Filter by asset layout ID. Only works with global /assets endpoint."),
  archived: z.boolean().optional().describe("Show only archived assets if true"),
  slug: z.string().optional().describe("Filter by URL slug"),
  updated_at: z.string().optional().describe("Filter assets updated within a range or at an exact time (ISO format: 'start,end' or 'exact')"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getAssetSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("The company ID the asset belongs to (required for Hudu asset lookups)"),
  asset_id: z.coerce.number().int().positive().describe("The ID of the asset to retrieve"),
});

// ---- Asset Layouts ----

export const listAssetLayoutsSchema = z.object({
  name: z.string().optional().describe("Filter asset layouts by name"),
  slug: z.string().optional().describe("Filter by URL slug"),
  active: z.boolean().optional().describe("Filter by active status (true = active layouts only)"),
  updated_at: z.string().optional().describe("Filter layouts updated within a range or at an exact time (ISO format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
});

export const getAssetLayoutSchema = z.object({
  layout_id: z.coerce.number().int().positive().describe("The ID of the asset layout to retrieve"),
});

// ---- Articles (Knowledge Base in UI) ----

export const listArticlesSchema = z.object({
  search: z.string().optional().describe("Search articles by keyword (fuzzy match). Use this for partial/natural-language lookups."),
  name: z.string().optional().describe("Filter articles by exact name. For partial lookups, use 'search' instead."),
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID. Omit for global KB articles."),
  draft: z.boolean().optional().describe("Filter by draft status (true = drafts only, false = published only)"),
  slug: z.string().optional().describe("Filter by URL slug"),
  updated_at: z.string().optional().describe("Filter articles updated within a range or at an exact time (ISO format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getArticleSchema = z.object({
  article_id: z.coerce.number().int().positive().describe("The ID of the article to retrieve"),
});

// ---- Expirations ----

export const listExpirationsSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter expirations by company ID"),
  expiration_type: z.string().optional().describe("Filter by type: 'domain', 'ssl_certificate', 'warranty', 'asset_field', 'article_expiration', or 'undeclared'"),
  resource_id: z.coerce.number().int().positive().optional().describe("Filter by resource ID (must be used with resource_type)"),
  resource_type: z.string().optional().describe("Filter by resource type e.g. 'Asset', 'AssetPassword', 'Company', 'Article' (must be used with resource_id)"),
  archived: z.boolean().optional().describe("Filter by archived status (true = archived, false = active, default false)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Websites ----

export const listWebsitesSchema = z.object({
  search: z.string().optional().describe("Search websites by keyword (fuzzy match). Use this for partial/natural-language lookups."),
  name: z.string().optional().describe("Filter websites by exact name. For partial lookups, use 'search' instead."),
  slug: z.string().optional().describe("Filter by URL slug"),
  updated_at: z.string().optional().describe("Filter websites updated within a range or at an exact time (ISO format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getWebsiteSchema = z.object({
  website_id: z.coerce.number().int().positive().describe("The ID of the website to retrieve"),
});

// ---- Procedures (Processes in the Hudu UI) ----

export const listProceduresSchema = z.object({
  name: z.string().optional().describe("Filter procedures by name"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID"),
  slug: z.string().optional().describe("Filter by URL slug"),
  global_template: z.enum(["true", "false"]).optional().describe("Filter for global templates ('true') vs company-specific procedures ('false')"),
  parent_procedure_id: z.coerce.number().int().positive().optional().describe("Filter for child procedures of a specific parent procedure"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getProcedureSchema = z.object({
  procedure_id: z.coerce.number().int().positive().describe("The ID of the procedure to retrieve"),
});

// ---- Activity Logs ----

export const listActivityLogsSchema = z.object({
  user_id: z.coerce.number().int().positive().optional().describe("Filter logs by user ID"),
  user_email: z.string().optional().describe("Filter logs by user email"),
  resource_id: z.coerce.number().int().positive().optional().describe("Filter by resource ID (must be used with resource_type)"),
  resource_type: z.string().optional().describe("Filter by resource type e.g. 'Asset', 'AssetPassword', 'Company', 'Article' (must be used with resource_id)"),
  action_message: z.string().optional().describe("Filter by action message"),
  start_date: z.string().optional().describe("Filter logs from this date (ISO 8601 format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Folders ----

export const listFoldersSchema = z.object({
  name: z.string().optional().describe("Filter folders by name"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter folders by company ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Users and Groups ----

export const listUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const listGroupsSchema = z.object({
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

// ---- Relations ----

export const listRelationsSchema = z.object({
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Networks (Phase 3, schemas defined now) ----

export const listNetworksSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter networks by company ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const listIpAddressesSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter IP addresses by company ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const listVlansSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter VLANs by company ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

// ---- Phase 2: Write operations (schemas defined now) ----

export const createAssetSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("The company ID to create the asset under (required)"),
  asset_layout_id: z.coerce.number().int().positive().describe("The asset layout ID to use"),
  name: z.string().describe("Name of the asset"),
  primary_serial: z.string().optional().describe("Primary serial number"),
  primary_model: z.string().optional().describe("Primary model"),
  primary_manufacturer: z.string().optional().describe("Primary manufacturer"),
  custom_fields: z.array(
    z.object({
      label: z.string().describe("Custom field label (must match layout field name exactly)"),
      value: z.union([z.string(), z.number(), z.boolean()]).describe("Field value"),
    })
  ).optional().describe("Array of custom field values to set on the asset"),
});

export const updateAssetSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("The company ID the asset belongs to (required)"),
  asset_id: z.coerce.number().int().positive().describe("The ID of the asset to update"),
  name: z.string().optional().describe("Updated asset name"),
  primary_serial: z.string().optional().describe("Updated serial number"),
  primary_model: z.string().optional().describe("Updated model"),
  primary_manufacturer: z.string().optional().describe("Updated manufacturer"),
  custom_fields: z.array(
    z.object({
      label: z.string().describe("Custom field label"),
      value: z.union([z.string(), z.number(), z.boolean()]).describe("Updated field value"),
    })
  ).optional().describe("Array of custom field values to update"),
});

export const createArticleSchema = z.object({
  name: z.string().describe("Article title"),
  content: z.string().describe("Article content (HTML string)"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID. Omit for a global KB article."),
  folder_id: z.coerce.number().int().positive().optional().describe("Folder ID to place the article in"),
});

export const updateArticleSchema = z.object({
  article_id: z.coerce.number().int().positive().describe("The ID of the article to update"),
  name: z.string().optional().describe("Updated article title"),
  content: z.string().optional().describe("Updated article content (HTML string)"),
  folder_id: z.coerce.number().int().positive().optional().describe("Move article to a different folder"),
});

export const listMagicDashSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe(
    "Filter widgets by company ID. If omitted, returns widgets across all companies."
  ),
  title: z.string().optional().describe(
    "Filter by exact widget title match. Useful for checking whether a widget with a specific title already exists (Magic Dash upserts by title+company)."
  ),
});

export const createMagicDashSchema = z.object({
  company_id: z.coerce.number().int().positive().describe(
    "Company ID to attach the Magic Dash widget to. The tool internally looks up the company's name (Hudu's /magic_dash endpoint quirkily requires company_name on the request body). Restricted to allowlisted users in production."
  ),
  title: z.string().min(1).max(200).describe(
    "Widget title. Hudu upserts by (title, company_id) — reusing a title replaces the existing widget's body."
  ),
  message: z.string().min(1).max(5000).describe(
    "Widget summary line. Plain text or HTML."
  ),
  shade: z.enum(["success", "info", "warning", "danger"]).optional().describe(
    "Color shade. Defaults to Hudu's own default if omitted."
  ),
  icon: z.string().max(100).optional().describe(
    "Font Awesome icon class (e.g. 'fas fa-sticky-note')."
  ),
  content_link: z.string().url().max(1000).optional().describe(
    "Optional URL the widget title points to when clicked."
  ),
  content: z.string().max(50000).optional().describe(
    "Optional expanded HTML body shown when the widget is opened. Distinct from 'message' (the summary line)."
  ),
  image_url: z.string().url().max(1000).optional().describe(
    "Optional image URL displayed on the widget (e.g. a logo or screenshot)."
  ),
});

export const deleteMagicDashSchema = z.object({
  magic_dash_id: z.coerce.number().int().positive().describe("The ID of the Magic Dash widget to delete"),
});

export const createRelationSchema = z.object({
  fromable_type: z.string().describe("Source entity type (e.g. 'Asset', 'Website', 'Company')"),
  fromable_id: z.coerce.number().int().positive().describe("Source entity ID"),
  toable_type: z.string().describe("Target entity type"),
  toable_id: z.coerce.number().int().positive().describe("Target entity ID"),
  description: z.string().optional().describe("Description of the relationship"),
});
