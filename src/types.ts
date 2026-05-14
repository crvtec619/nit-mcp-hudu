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

export interface HuduNetwork {
  id: number;
  company_id: number;
  name: string | null;
  address: string | null;
  network_type: string | null;
  cidr: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ---- IP Addresses ----

export interface HuduIpAddress {
  id: number;
  company_id: number;
  address: string | null;
  status: string | null;
  description: string | null;
  fqdn: string | null;
  nat_address: string | null;
  created_at: string;
  updated_at: string;
}

// ---- VLANs ----

export interface HuduVlan {
  id: number;
  company_id: number;
  name: string | null;
  vid: number | null;
  description: string | null;
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
// GET /lists returns list metadata; GET /lists/:id returns the list with its
// list_options inline (verified shape may vary by Hudu version).

export interface HuduListOption {
  id: number;
  name: string;
  position: number | null;
}

export interface HuduList {
  id: number;
  name: string;
  description: string | null;
  list_options?: HuduListOption[];
  created_at: string;
  updated_at: string;
}

// ---- Racks ----

export interface HuduRack {
  id: number;
  company_id: number;
  location_id: number | null;
  name: string;
  description: string | null;
  height: number | null;
  width: number | null;
  starting_unit: number | null;
  numbering_ascending: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface HuduRackStorageItem {
  id: number;
  rack_storage_id: number;
  asset_id: number | null;
  name: string | null;
  description: string | null;
  status: string | null;
  start_unit: number | null;
  end_unit: number | null;
  units: number | null;
  side: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Uploads ----

export interface HuduUpload {
  id: number;
  uploadable_type: string | null;
  uploadable_id: number | null;
  name: string | null;
  url: string | null;
  content_type: string | null;
  size: number | null;
  archived: boolean | null;
  created_at: string;
  updated_at: string;
}

// ---- Cards (integration sync objects) ----

export interface HuduCard {
  id: number;
  integrator_id: number | null;
  integrator_name: string | null;
  sync_id: string | null;
  sync_type: string | null;
  name: string | null;
  data: unknown;
  created_at: string;
  updated_at: string;
}

// ---- Matchers (integration object matchers) ----

export interface HuduMatcher {
  id: number;
  integrator_id: number | null;
  integrator_name: string | null;
  matched: boolean | null;
  identifier: string | null;
  company_id: number | null;
  potential_company_id: number | null;
  sync_id: string | null;
  created_at: string;
  updated_at: string;
}

// ---- App Info ----

export interface HuduAppInfo {
  version: string;
  date: string;
}
