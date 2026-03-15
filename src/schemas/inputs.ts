import { z } from "zod";

// ---- Companies ----

export const listCompaniesSchema = z.object({
  name: z.string().optional().describe("Filter companies by name (partial match)"),
  phone: z.string().optional().describe("Filter by phone number"),
  website: z.string().optional().describe("Filter by website URL"),
  city: z.string().optional().describe("Filter by city"),
  state: z.string().optional().describe("Filter by state"),
  id_in_integration: z.string().optional().describe("Filter by external integration ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const getCompanySchema = z.object({
  company_id: z.coerce.number().int().positive().describe("The ID of the company to retrieve"),
});

// ---- Assets ----

export const listAssetsSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter assets by company ID. If set, uses the company-scoped endpoint."),
  name: z.string().optional().describe("Filter assets by name (partial match)"),
  asset_layout_id: z.coerce.number().int().positive().optional().describe("Filter by asset layout ID"),
  archived: z.boolean().optional().describe("Include archived assets if true"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const getAssetSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("The company ID the asset belongs to (required for Hudu asset lookups)"),
  asset_id: z.coerce.number().int().positive().describe("The ID of the asset to retrieve"),
});

// ---- Asset Layouts ----

export const listAssetLayoutsSchema = z.object({
  name: z.string().optional().describe("Filter asset layouts by name"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const getAssetLayoutSchema = z.object({
  layout_id: z.coerce.number().int().positive().describe("The ID of the asset layout to retrieve"),
});

// ---- Articles (Knowledge Base in UI) ----

export const listArticlesSchema = z.object({
  name: z.string().optional().describe("Filter articles by name (partial match)"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID. Omit for global KB articles."),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const getArticleSchema = z.object({
  article_id: z.coerce.number().int().positive().describe("The ID of the article to retrieve"),
});

// ---- Expirations ----

export const listExpirationsSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter expirations by company ID"),
  expiration_type: z.string().optional().describe("Filter by type (e.g. 'domain', 'ssl_certificate', 'warranty')"),
  resource_id: z.coerce.number().int().positive().optional().describe("Filter by the expirable resource ID"),
  resource_type: z.string().optional().describe("Filter by the expirable resource type"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

// ---- Websites ----

export const listWebsitesSchema = z.object({
  name: z.string().optional().describe("Filter websites by name (partial match)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const getWebsiteSchema = z.object({
  website_id: z.coerce.number().int().positive().describe("The ID of the website to retrieve"),
});

// ---- Procedures (Processes in the Hudu UI) ----

export const listProceduresSchema = z.object({
  name: z.string().optional().describe("Filter procedures by name"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

export const getProcedureSchema = z.object({
  procedure_id: z.coerce.number().int().positive().describe("The ID of the procedure to retrieve"),
});

// ---- Activity Logs ----

export const listActivityLogsSchema = z.object({
  user_id: z.coerce.number().int().positive().optional().describe("Filter logs by user ID"),
  user_email: z.string().optional().describe("Filter logs by user email"),
  resource_id: z.coerce.number().int().positive().optional().describe("Filter by resource ID"),
  resource_type: z.string().optional().describe("Filter by resource type (e.g. 'Asset', 'Company', 'Article')"),
  action_message: z.string().optional().describe("Filter by action message"),
  start_date: z.string().optional().describe("Filter logs from this date (ISO format: YYYY-MM-DD)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
});

// ---- Folders ----

export const listFoldersSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter folders by company ID"),
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
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
  page: z.coerce.number().min(1).default(1).describe("Page number (25 results per page, default 1)"),
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

export const createMagicDashSchema = z.object({
  title: z.string().describe("Magic Dash widget title"),
  company_name: z.string().optional().describe("Company name to associate the widget with"),
  message: z.string().optional().describe("Widget message/body text"),
  icon: z.string().optional().describe("FontAwesome icon class (e.g. 'fas fa-ticket-alt')"),
  image_url: z.string().optional().describe("URL to an image for the widget"),
  content_link: z.string().optional().describe("URL the widget links to when clicked"),
  content: z.string().optional().describe("HTML content for the widget body"),
  shade: z.string().optional().describe("Widget color shade: 'success', 'warning', 'danger', or 'info'"),
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
