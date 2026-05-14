// ---- Pagination ----

export interface HuduPagedResponse<T> {
  records: T[];
  page: number;
  hasMore: boolean;
}

// ---- Companies ----

export interface HuduCompany {
  id: number;
  name: string;
  nickname: string | null;
  company_type: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country_name: string | null;
  phone_number: string | null;
  fax_number: string | null;
  website: string | null;
  notes: string | null;
  parent_company_id: number | null;
  parent_company_name: string | null;
  id_number: string | null;
  slug: string | null;
  archived: boolean;
  object_type: string;
  url: string | null;
  full_url: string | null;
  knowledge_base_url: string | null;
  passwords_url: string | null;
  integrations: unknown[];
  created_at: string;
  updated_at: string;
}

// ---- Assets ----

export interface HuduAsset {
  id: number;
  company_id: number;
  company_name: string | null;
  asset_layout_id: number;
  slug: string | null;
  name: string;
  primary_serial: string | null;
  primary_model: string | null;
  primary_manufacturer: string | null;
  primary_mail: string | null;
  archived: boolean;
  object_type: string;
  asset_type: string | null;
  created_at: string;
  updated_at: string;
  url: string | null;
  fields: HuduAssetField[];
  cards: unknown[];
}

export interface HuduAssetField {
  id: number;
  label: string;
  value: string | number | boolean | null;
  position: number;
}

// ---- Asset Layouts ----

export interface HuduAssetLayout {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  icon_color: string | null;
  fields: HuduAssetLayoutField[];
  active: boolean;
  slug: string | null;
  include_comments: boolean;
  include_files: boolean;
  include_passwords: boolean;
  include_photos: boolean;
  location: string | null;
  sidebar_folder_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface HuduAssetLayoutField {
  id: number;
  label: string;
  field_type: string;
  required: boolean;
  hint: string | null;
  position: number;
  show_in_list: boolean;
  options: string | null;
  min: number | null;
  max: number | null;
  linkable_id: number | null;
  expiration: boolean;
  is_destroyed: boolean;
}

// ---- Articles (Knowledge Base) ----

export interface HuduArticle {
  id: number;
  name: string;
  content: string | null;
  slug: string | null;
  company_id: number | null;
  folder_id: number | null;
  draft: boolean;
  archived: boolean;
  enable_sharing: boolean | null;
  share_url: string | null;
  url: string | null;
  object_type: string;
  public_photos: unknown[];
  created_at: string;
  updated_at: string;
}

// ---- Procedures (Processes in UI) ----

export interface HuduProcedure {
  id: number;
  name: string;
  description: string | null;
  company_name: string | null;
  slug: string | null;
  url: string | null;
  share_url: string | null;
  object_type: string;
  total: number;
  completed: number;
  completion_percentage: string | null;
  parent_procedure: unknown | null;
  asset: number | null;
  procedure_tasks_attributes: unknown[];
  created_at: string;
  updated_at: string;
}

// ---- Websites ----

export interface HuduWebsite {
  id: number;
  name: string;
  slug: string | null;
  company_id: number | null;
  company_name: string | null;
  paused: boolean;
  disable_dns: boolean;
  disable_ssl: boolean;
  disable_whois: boolean;
  enable_dmarc_tracking: boolean;
  enable_dkim_tracking: boolean;
  enable_spf_tracking: boolean;
  url: string | null;
  status: string | null;
  monitoring_status: string | null;
  monitor_type: string | null;
  notes: string | null;
  object_type: string;
  asset_type: string | null;
  icon: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Expirations ----

export interface HuduExpiration {
  id: number;
  expirationable_type: string;
  expirationable_id: number;
  expiration_type: string | null;
  date: string | null;
  company_id: number | null;
  asset_field_id: number | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Activity Logs ----

export interface HuduActivityLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  user_short_name: string | null;
  user_initials: string | null;
  action: string;
  record_type: string | null;
  record_id: number | null;
  record_name: string | null;
  original_record_name: string | null;
  company_name: string | null;
  ip_address: string | null;
  details: string | null;
  formatted_datetime: string | null;
  url: string | null;
  record_url: string | null;
  record_company_url: string | null;
  record_user_url: string | null;
  app_type: string | null;
  agent_string: string | null;
  device: string | null;
  os: string | null;
  token: string | null;
  created_at: string;
}

// ---- Folders ----

export interface HuduFolder {
  id: number;
  name: string;
  icon: string | null;
  description: string | null;
  company_id: number | null;
  parent_folder_id: number | null;
  created_at: string;
  updated_at: string;
}

// ---- Relations ----

export interface HuduRelation {
  id: number;
  name: string | null;
  description: string | null;
  fromable_type: string;
  fromable_id: number;
  fromable_url: string | null;
  toable_type: string;
  toable_id: number;
  toable_url: string | null;
  is_inverse: boolean;
}

// ---- Users ----

export interface HuduUser {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  security_level: string | null;
  archived: boolean;
  accepted_invite: boolean;
  currently_signed_in: boolean;
  otp_required_for_login: boolean;
  sign_in_count: number;
  last_sign_in_at: string | null;
  phone_number: string | null;
  slug: string | null;
  time_zone: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Groups ----

export interface HuduGroup {
  id: number;
  name: string;
  slug: string | null;
  url: string | null;
  default: boolean | null;
  member_count: number;
  members: unknown[];
  created_at: string;
  updated_at: string;
}

// ---- Magic Dash ----
// Verified against live GET /magic_dash and POST /magic_dash responses:
// the response does NOT include created_at / updated_at, but does
// include a `position` field for ordering within a company.

export interface HuduMagicDash {
  id: number;
  title: string;
  company_name: string | null;
  company_id: number | null;
  message: string | null;
  icon: string | null;
  image_url: string | null;
  content_link: string | null;
  content: string | null;
  shade: string | null;
  position: number | null;
}

// ---- Networks ----
// Verified shape from GET /networks/:id (2026-05-13). network_type is a numeric
// enum, not a string. /networks does NOT accept ?page=.

export interface HuduNetwork {
  id: number;
  company_id: number;
  name: string | null;
  address: string | null;
  network_type: number | null;
  slug: string | null;
  location_id: number | null;
  description: string | null;
  notes: string | null;
  ancestry: string | null;
  settings: Record<string, unknown> | null;
  sync_identifier: string | null;
  is_radar: boolean | null;
  status_list_item_id: number | null;
  role_list_item_id: number | null;
  vlan_id: number | null;
  url: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- IP Addresses ----
// Verified shape from GET /ip_addresses/:id (2026-05-13). /ip_addresses does
// NOT accept ?page=.

export interface HuduIpAddress {
  id: number;
  company_id: number;
  address: string | null;
  status: string | null;
  asset_id: number | null;
  asset_name: string | null;
  asset_url: string | null;
  notes: string | null;
  description: string | null;
  fqdn: string | null;
  url: string | null;
  discarded_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- VLANs ----
// Verified shape from GET /vlans/:id (2026-05-13). Field is `vlan_id` (numeric
// 1-4094), not `vid`. Endpoint returns bare array; does not paginate.

export interface HuduVlan {
  id: number;
  name: string | null;
  slug: string | null;
  vlan_id: number | null;
  description: string | null;
  notes: string | null;
  company_id: number;
  vlan_zone_id: number | null;
  status_list_item_id: number | null;
  role_list_item_id: number | null;
  networks_count: number | null;
  url: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- VLAN Zones ----
// Logical grouping of VLANs (datacenter, building). vlan_id_ranges is a string
// like "100-500,1000-1500".

export interface HuduVlanZone {
  id: number;
  name: string | null;
  slug: string | null;
  description: string | null;
  vlan_id_ranges: string | null;
  company_id: number;
  vlans_count: number | null;
  url: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Flags ----
// Lightweight labels attached to any record. flagable_type is one of: Asset,
// Website, Article, AssetPassword, Company, Procedure, RackStorage, Network,
// IpAddress, Vlan, VlanZone.

export interface HuduFlag {
  id: number;
  flag_type_id: number;
  description: string | null;
  flagable_type: string;
  flagable_id: number;
  created_at: string;
  updated_at: string;
}

export interface HuduFlagType {
  id: number;
  name: string;
  color: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Procedure Tasks ----
// Individual tasks within a Process (template) or Run (active instance).

export interface HuduProcedureTask {
  id: number;
  name: string;
  description: string | null;
  position: number | null;
  priority: string | null;
  completed: boolean | null;
  completed_date: string | null;
  completion_notes: string | null;
  due_date: string | null;
  formatted_due_date: string | null;
  user_id: number | null;
  user_name: string | null;
  assigned_users: number[] | null;
  first_assigned_user_id: number | null;
  first_assigned_user_name: string | null;
  procedure_id: number;
  optional: boolean | null;
  parent_task_id: number | null;
  subtask_ids: number[] | null;
  subtask_count: number | null;
  has_subtasks: boolean | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Passwords ----
// asset_passwords list/get not included; API key is configured without password
// access. password_folders (folder structure only, no credentials) is exposed.

export interface HuduPasswordFolder {
  id: number;
  name: string;
  description: string | null;
  company_id: number | null;
  parent_password_folder_id: number | null;
  allowed_groups: unknown[] | null;
  allowed_users: unknown[] | null;
  created_at: string;
  updated_at: string;
}

// ---- Lists ----
// Hudu Admin > Lists. Used as the source of options for ListSelect layout fields.
// GET /lists returns lists with `list_items` inline (verified 2026-05-13).

export interface HuduListItem {
  id: number;
  name: string;
}

export interface HuduList {
  id: number;
  name: string;
  description?: string | null;
  list_items?: HuduListItem[];
  created_at: string;
  updated_at: string;
}

// ---- Uploads ----
// Verified shape from GET /uploads/:id (2026-05-13). `size` is a human-readable
// string (e.g. "61.8 KB"), `mime` is the content type, `created_date` is a
// formatted string. No updated_at; archival is via archived_at timestamp.

export interface HuduUpload {
  id: number;
  slug: string | null;
  url: string | null;
  name: string | null;
  ext: string | null;
  mime: string | null;
  size: string | null;
  created_date: string | null;
  archived_at: string | null;
  uploadable_id: number | null;
  uploadable_type: string | null;
}

// ---- App Info ----

export interface HuduAppInfo {
  version: string;
  date: string;
}
