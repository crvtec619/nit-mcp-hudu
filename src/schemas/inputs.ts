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
  enable_sharing: z.boolean().optional().describe("Filter by public-sharing status (true = articles with a public share URL)"),
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
// Hudu calls templates "processes" and active instances "runs". The list
// endpoint returns both; use `type` to filter.

export const listProceduresSchema = z.object({
  name: z.string().optional().describe("Filter procedures by name (exact match, case-insensitive)"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID"),
  slug: z.string().optional().describe("Filter by URL slug"),
  type: z.enum(["process", "run", "all"]).optional().describe("Filter by type: 'process' (templates), 'run' (active instances), or 'all' (both, default)"),
  process_scope: z.enum(["global", "company"]).optional().describe("Filter processes by scope: 'global' (available to all companies) or 'company' (company-specific)"),
  parent_process_id: z.coerce.number().int().positive().optional().describe("Filter runs by parent process ID (the process they were kicked off from)"),
  parent_procedure_id: z.coerce.number().int().positive().optional().describe("DEPRECATED alias for parent_process_id. Prefer parent_process_id."),
  global_template: z.enum(["true", "false"]).optional().describe("DEPRECATED. Use process_scope instead."),
  archived: z.enum(["true", "false", "1", "0"]).optional().describe("Filter by archived status. Defaults to non-archived only if omitted."),
  created_at: z.string().optional().describe("Filter by creation date (ISO format, or 'start,end' range)"),
  updated_at: z.string().optional().describe("Filter by update date (ISO format, or 'start,end' range)"),
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
// Folders are typed: 'article' (KB folders) or 'photo' (photo folders).

export const listFoldersSchema = z.object({
  name: z.string().optional().describe("Filter folders by name"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter folders by company ID"),
  in_company: z.boolean().optional().describe("When true, returns only company-specific folders"),
  folder_type: z.enum(["article", "photo"]).optional().describe("Filter by folder type: 'article' (KB folders) or 'photo' (photo folders)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Users and Groups ----

export const listUsersSchema = z.object({
  first_name: z.string().optional().describe("Filter users by first name"),
  last_name: z.string().optional().describe("Filter users by last name"),
  search: z.string().optional().describe("Search across first and last name (fuzzy match)"),
  email: z.string().optional().describe("Filter users by email address"),
  security_level: z.enum(["super_admin", "admin", "spectator", "editor", "author", "portal_member", "portal_admin"]).optional().describe("Filter by security level"),
  portal_member_company_id: z.coerce.number().int().positive().optional().describe("Filter portal members by their associated company ID"),
  archived: z.boolean().optional().describe("Filter by archived status"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const listGroupsSchema = z.object({
  name: z.string().optional().describe("Filter groups by name (case-insensitive)"),
  default: z.boolean().optional().describe("Filter by default-group status"),
  search: z.string().optional().describe("Search across group names"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Relations ----

export const listRelationsSchema = z.object({
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Networks / IPAM ----
// Note: /networks and /ip_addresses return ALL records in one response and
// reject ?page= with HTTP 400. No pagination params here.

export const listNetworksSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter networks by company ID"),
});

export const getNetworkSchema = z.object({
  network_id: z.coerce.number().int().positive().describe("The ID of the network to retrieve"),
});

export const listIpAddressesSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter IP addresses by company ID"),
  network_id: z.coerce.number().int().positive().optional().describe("Filter IPs by parent network ID"),
  address: z.string().optional().describe("Filter by exact IP address"),
  status: z.string().optional().describe("Filter by status (e.g. 'Assigned', 'Available', 'Reserved')"),
});

export const getIpAddressSchema = z.object({
  ip_address_id: z.coerce.number().int().positive().describe("The ID of the IP address record to retrieve"),
});

// ---- VLANs ----
// /vlans returns ALL records in one response (no pagination).

export const listVlansSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter VLANs by company ID"),
  vlan_zone_id: z.coerce.number().int().positive().optional().describe("Filter VLANs by VLAN Zone ID"),
  name: z.string().optional().describe("Filter by VLAN name (exact match)"),
  vlan_id: z.coerce.number().int().positive().optional().describe("Filter by numeric VLAN ID (1-4094)"),
  archived: z.boolean().optional().describe("Filter by archive status (default: non-archived only)"),
});

export const getVlanSchema = z.object({
  vlan_id: z.coerce.number().int().positive().describe("The ID of the VLAN record to retrieve"),
});

// ---- VLAN Zones ----

export const listVlanZonesSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID"),
  name: z.string().optional().describe("Filter by zone name (exact match)"),
  archived: z.boolean().optional().describe("Filter by archive status (default: non-archived only)"),
});

export const getVlanZoneSchema = z.object({
  vlan_zone_id: z.coerce.number().int().positive().describe("The ID of the VLAN Zone to retrieve"),
});

// ---- Flags and Flag Types ----

export const listFlagsSchema = z.object({
  flag_type_id: z.coerce.number().int().positive().optional().describe("Filter by flag type ID"),
  flagable_type: z.enum(["Asset", "Website", "Article", "AssetPassword", "Company", "Procedure", "RackStorage", "Network", "IpAddress", "Vlan", "VlanZone"]).optional().describe("Filter by record type that the flag is attached to"),
  flagable_id: z.coerce.number().int().positive().optional().describe("Filter by record ID (pair with flagable_type)"),
  description: z.string().optional().describe("Filter by flag description"),
  created_at: z.string().optional().describe("Filter by creation date (ISO format)"),
  updated_at: z.string().optional().describe("Filter by update date (ISO format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getFlagSchema = z.object({
  flag_id: z.coerce.number().int().positive().describe("The ID of the flag to retrieve"),
});

export const listFlagTypesSchema = z.object({
  name: z.string().optional().describe("Filter by exact flag type name"),
  color: z.string().optional().describe("Filter by color value"),
  slug: z.string().optional().describe("Filter by slug"),
  created_at: z.string().optional().describe("Filter by creation date (ISO format)"),
  updated_at: z.string().optional().describe("Filter by update date (ISO format)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getFlagTypeSchema = z.object({
  flag_type_id: z.coerce.number().int().positive().describe("The ID of the flag type to retrieve"),
});

// ---- Procedure Tasks ----
// Individual tasks within a Process (template) or Run (active instance).
// `procedure_id` filters by either parent process or parent run.

export const listProcedureTasksSchema = z.object({
  procedure_id: z.coerce.number().int().positive().optional().describe("Filter by process or run ID (returns all tasks for that process/run)"),
  name: z.string().optional().describe("Filter by task name"),
  company_id: z.coerce.number().int().positive().optional().describe("Filter by company ID"),
});

export const getProcedureTaskSchema = z.object({
  procedure_task_id: z.coerce.number().int().positive().describe("The ID of the procedure task to retrieve"),
});

// ---- Lists (Admin > Lists; source for ListSelect layout fields) ----

export const listListsSchema = z.object({
  query: z.string().optional().describe("Search lists by name (partial match)"),
  name: z.string().optional().describe("Filter by exact list name"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

export const getListSchema = z.object({
  list_id: z.coerce.number().int().positive().describe("The ID of the list to retrieve (includes list_options)"),
});

// ---- Password Folders ----
// Folder structure only. asset_passwords list/get is intentionally NOT exposed;
// the API key is provisioned without password access.

export const listPasswordFoldersSchema = z.object({
  company_id: z.coerce.number().int().positive().optional().describe("Filter password folders by company ID"),
  name: z.string().optional().describe("Filter password folders by name"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
});

// ---- Uploads (attachments) ----

export const listUploadsSchema = z.object({
  uploadable_type: z.string().optional().describe("Filter by parent record type (e.g. 'Asset', 'Article', 'Company')"),
  uploadable_id: z.coerce.number().int().positive().optional().describe("Filter by parent record ID (must be paired with uploadable_type)"),
  page: z.coerce.number().min(1).default(1).describe("Page number (default 1)"),
  page_size: z.coerce.number().min(1).max(1000).optional().describe("Number of results per page (default 25)"),
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

// ---- Asset Layouts (write) ----

const assetLayoutFieldSchema = z.object({
  label: z.string().describe("Field label shown on the asset"),
  field_type: z.string().describe(
    "Field type. Common values: Text, RichText, Heading, CheckBox, Website, Number, Date, Email, Phone, ListSelect, AssetTag, Embed, Password."
  ),
  position: z.coerce.number().int().min(0).optional().describe("Display order (0-based)"),
  required: z.boolean().optional().describe("Whether the field is required"),
  show_in_list: z.boolean().optional().describe("Show this field in list views"),
  hint: z.string().optional().describe("Help text shown under the field"),
  options: z.string().optional().describe("For ListSelect: comma-separated options, or a list name"),
  expiration: z.boolean().optional().describe("Treat a Date field as an expiration date"),
});

export const createAssetLayoutSchema = z.object({
  name: z.string().describe("Asset layout (template) name"),
  icon: z.string().optional().describe("FontAwesome icon class (e.g. 'fas fa-server')"),
  color: z.string().optional().describe("Header color hex (e.g. '#0078d4')"),
  icon_color: z.string().optional().describe("Icon color hex"),
  include_passwords: z.boolean().optional().describe("Allow related passwords on this layout"),
  include_photos: z.boolean().optional().describe("Allow photos on this layout"),
  include_comments: z.boolean().optional().describe("Allow comments on this layout"),
  include_files: z.boolean().optional().describe("Allow file attachments on this layout"),
  fields: z.array(assetLayoutFieldSchema).min(1).describe("Field definitions for the layout"),
});

export const updateAssetLayoutSchema = z.object({
  asset_layout_id: z.coerce.number().int().positive().describe("The ID of the asset layout to update"),
  name: z.string().optional().describe("Updated layout name"),
  icon: z.string().optional().describe("Updated FontAwesome icon class"),
  color: z.string().optional().describe("Updated header color hex"),
  icon_color: z.string().optional().describe("Updated icon color hex"),
  active: z.boolean().optional().describe("Activate or deactivate the layout"),
  fields: z.array(assetLayoutFieldSchema).optional().describe(
    "Full replacement set of field definitions. Omit to leave fields unchanged. Include existing fields you want to keep."
  ),
});

// ---- Networks (write) ----

export const createNetworkSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("Company ID the network belongs to (required)"),
  name: z.string().describe("Network name"),
  address: z.string().describe("Network address in CIDR notation (e.g. '10.0.0.0/24')"),
  network_type: z.coerce.number().int().optional().describe("Numeric network type enum (verify values in Hudu)"),
  description: z.string().optional().describe("Network description"),
  notes: z.string().optional().describe("Freeform notes"),
  vlan_id: z.coerce.number().int().positive().optional().describe("Associated VLAN record ID (Hudu internal id, not the 802.1Q number)"),
});

export const updateNetworkSchema = z.object({
  network_id: z.coerce.number().int().positive().describe("The ID of the network to update"),
  company_id: z.coerce.number().int().positive().describe("Company ID the network belongs to (for write-scope check)"),
  name: z.string().optional().describe("Updated network name"),
  address: z.string().optional().describe("Updated CIDR address"),
  network_type: z.coerce.number().int().optional().describe("Updated numeric network type enum"),
  description: z.string().optional().describe("Updated description"),
  notes: z.string().optional().describe("Updated notes"),
  vlan_id: z.coerce.number().int().positive().optional().describe("Updated associated VLAN record ID"),
});

// ---- IP Addresses (write) ----

export const createIpAddressSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("Company ID the IP belongs to (required)"),
  address: z.string().describe("IP address (e.g. '10.0.0.5')"),
  status: z.string().optional().describe("Status (e.g. 'assigned', 'reserved', 'unassigned')"),
  fqdn: z.string().optional().describe("Fully qualified domain name"),
  description: z.string().optional().describe("Description"),
  notes: z.string().optional().describe("Freeform notes"),
  asset_id: z.coerce.number().int().positive().optional().describe("Asset ID this IP is assigned to"),
});

export const updateIpAddressSchema = z.object({
  ip_address_id: z.coerce.number().int().positive().describe("The ID of the IP address record to update"),
  company_id: z.coerce.number().int().positive().describe("Company ID the IP belongs to (for write-scope check)"),
  address: z.string().optional().describe("Updated IP address"),
  status: z.string().optional().describe("Updated status"),
  fqdn: z.string().optional().describe("Updated FQDN"),
  description: z.string().optional().describe("Updated description"),
  notes: z.string().optional().describe("Updated notes"),
  asset_id: z.coerce.number().int().positive().optional().describe("Updated assigned asset ID"),
});

// ---- VLANs (write) ----

export const createVlanSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("Company ID the VLAN belongs to (required)"),
  name: z.string().describe("VLAN name"),
  vlan_id: z.coerce.number().int().min(1).max(4094).describe("802.1Q VLAN number (1-4094)"),
  description: z.string().optional().describe("VLAN description"),
  notes: z.string().optional().describe("Freeform notes"),
  vlan_zone_id: z.coerce.number().int().positive().optional().describe("VLAN zone record ID this VLAN belongs to"),
});

export const updateVlanSchema = z.object({
  vlan_record_id: z.coerce.number().int().positive().describe("The Hudu record ID of the VLAN to update (not the 802.1Q number)"),
  company_id: z.coerce.number().int().positive().describe("Company ID the VLAN belongs to (for write-scope check)"),
  name: z.string().optional().describe("Updated VLAN name"),
  vlan_id: z.coerce.number().int().min(1).max(4094).optional().describe("Updated 802.1Q VLAN number (1-4094)"),
  description: z.string().optional().describe("Updated description"),
  notes: z.string().optional().describe("Updated notes"),
  vlan_zone_id: z.coerce.number().int().positive().optional().describe("Updated VLAN zone record ID"),
});

// ---- VLAN Zones (write) ----

export const createVlanZoneSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("Company ID the VLAN zone belongs to (required)"),
  name: z.string().describe("VLAN zone name (e.g. a datacenter or building)"),
  description: z.string().optional().describe("Zone description"),
  vlan_id_ranges: z.string().optional().describe("Allowed VLAN number ranges, e.g. '100-500,1000-1500'"),
});

export const updateVlanZoneSchema = z.object({
  vlan_zone_id: z.coerce.number().int().positive().describe("The ID of the VLAN zone to update"),
  company_id: z.coerce.number().int().positive().describe("Company ID the VLAN zone belongs to (for write-scope check)"),
  name: z.string().optional().describe("Updated zone name"),
  description: z.string().optional().describe("Updated description"),
  vlan_id_ranges: z.string().optional().describe("Updated VLAN number ranges"),
});

// ---- Folders (write) ----

export const createFolderSchema = z.object({
  name: z.string().describe("Folder name"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID. Omit for a global (Knowledge Base) folder."),
  parent_folder_id: z.coerce.number().int().positive().optional().describe("Parent folder ID to nest under. Omit for a top-level folder."),
  icon: z.string().optional().describe("FontAwesome icon class (e.g. 'fas fa-folder')"),
  description: z.string().optional().describe("Folder description"),
});

export const updateFolderSchema = z.object({
  folder_id: z.coerce.number().int().positive().describe("The ID of the folder to update"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID the folder belongs to (for write-scope check, when known)"),
  name: z.string().optional().describe("Updated folder name"),
  parent_folder_id: z.union([z.coerce.number().int().positive(), z.null()]).optional().describe(
    "Reparent the folder: set to a folder ID to move under it, or null to move to the top level. Omit to leave the parent unchanged."
  ),
  icon: z.string().optional().describe("Updated FontAwesome icon class"),
  description: z.string().optional().describe("Updated description"),
});

// ---- Lists (write) ----

export const createListSchema = z.object({
  name: z.string().describe("List name"),
  description: z.string().optional().describe("List description"),
  items: z.array(z.string()).optional().describe("Initial list item names (the selectable options for ListSelect fields)"),
});

export const updateListSchema = z.object({
  list_id: z.coerce.number().int().positive().describe("The ID of the list to update"),
  name: z.string().optional().describe("Updated list name"),
  description: z.string().optional().describe("Updated description"),
  items: z.array(z.string()).optional().describe(
    "Replacement set of list item names. Omit to leave items unchanged; include existing names you want to keep."
  ),
});

// ---- Flags (write) ----

export const createFlagSchema = z.object({
  flag_type_id: z.coerce.number().int().positive().describe("Flag type ID (see hudu_list_flag_types)"),
  flagable_type: z.string().describe("Record type to flag: Asset, Website, Article, Company, Procedure, Network, IpAddress, Vlan, VlanZone, etc."),
  flagable_id: z.coerce.number().int().positive().describe("ID of the record to flag"),
  description: z.string().optional().describe("Flag description / note"),
});

export const updateFlagSchema = z.object({
  flag_id: z.coerce.number().int().positive().describe("The ID of the flag to update"),
  flag_type_id: z.coerce.number().int().positive().optional().describe("Re-assign the flag to a different flag type"),
  description: z.string().optional().describe("Updated flag description / note"),
});

export const deleteFlagSchema = z.object({
  flag_id: z.coerce.number().int().positive().describe("The ID of the flag to remove (this is a deliberate exception to the no-delete rule; flags are lightweight and reversible)"),
});

// ---- Flag types (write) ----

// Hudu flag-type color is a fixed palette NAME, not a hex value (hex 422s).
// Confirmed live: Red, Orange, Yellow, Green, Blue, Purple, Grey ("Grey", not "Gray").
const flagTypeColor = z.enum(["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Grey"]);

export const createFlagTypeSchema = z.object({
  name: z.string().describe("Flag type name (e.g. 'Outdated', 'Needs Review')"),
  color: flagTypeColor.describe("Palette color name (NOT hex): Red, Orange, Yellow, Green, Blue, Purple, or Grey ('Grey', not 'Gray')."),
});

export const updateFlagTypeSchema = z.object({
  flag_type_id: z.coerce.number().int().positive().describe("The ID of the flag type to update"),
  name: z.string().optional().describe("Updated flag type name"),
  color: flagTypeColor.optional().describe("Updated palette color name (NOT hex): Red, Orange, Yellow, Green, Blue, Purple, or Grey."),
});

// ---- Archive / unarchive (write) ----

export const archiveAssetSchema = z.object({
  company_id: z.coerce.number().int().positive().describe("Company ID the asset belongs to (required)"),
  asset_id: z.coerce.number().int().positive().describe("Asset ID"),
});

export const archiveArticleSchema = z.object({
  article_id: z.coerce.number().int().positive().describe("Article ID"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID (for write-scope check, when known)"),
});

export const archiveWebsiteSchema = z.object({
  website_id: z.coerce.number().int().positive().describe("Website ID"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID (for write-scope check, when known)"),
});

// ---- Procedures + tasks (write) ----

export const createProcedureSchema = z.object({
  name: z.string().describe("Procedure (Process) name"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID. Omit for a global template."),
  description: z.string().optional().describe("Procedure description"),
});

export const updateProcedureSchema = z.object({
  procedure_id: z.coerce.number().int().positive().describe("The ID of the procedure to update"),
  company_id: z.coerce.number().int().positive().optional().describe("Company ID (for write-scope check, when known)"),
  name: z.string().optional().describe("Updated name"),
  description: z.string().optional().describe("Updated description"),
});

export const createProcedureTaskSchema = z.object({
  procedure_id: z.coerce.number().int().positive().describe("Parent procedure ID"),
  name: z.string().describe("Task name"),
  description: z.string().optional().describe("Task description"),
  position: z.coerce.number().int().min(0).optional().describe("Order within the procedure"),
  priority: z.string().optional().describe("Priority (e.g. low, normal, high)"),
  due_date: z.string().optional().describe("Due date (ISO 8601)"),
  optional: z.boolean().optional().describe("Whether the task is optional"),
});

export const updateProcedureTaskSchema = z.object({
  procedure_task_id: z.coerce.number().int().positive().describe("The ID of the procedure task to update"),
  name: z.string().optional().describe("Updated task name"),
  description: z.string().optional().describe("Updated description"),
  position: z.coerce.number().int().min(0).optional().describe("Updated order"),
  priority: z.string().optional().describe("Updated priority"),
  completed: z.boolean().optional().describe("Mark complete or incomplete"),
  due_date: z.string().optional().describe("Updated due date (ISO 8601)"),
  optional: z.boolean().optional().describe("Updated optional flag"),
});
