import type {
  HuduCompany,
  HuduAsset,
  HuduAssetLayout,
  HuduArticle,
  HuduProcedure,
  HuduWebsite,
  HuduExpiration,
  HuduActivityLog,
  HuduFolder,
  HuduRelation,
  HuduUser,
  HuduGroup,
  HuduNetwork,
  HuduIpAddress,
  HuduVlan,
  HuduMagicDash,
  HuduList,
  HuduPasswordFolder,
  HuduUpload,
  HuduAppInfo,
  HuduVlanZone,
  HuduFlag,
  HuduFlagType,
  HuduProcedureTask,
  HuduPagedResponse,
} from "../types";

/** Escape pipe characters so they don't break markdown table cells. */
function esc(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\|/g, "\\|");
}

function truncate(text: string | null | undefined, maxLen = 200): string {
  if (!text) return "";
  const clean = stripHtml(text);
  if (clean.length <= maxLen) return esc(clean);
  return esc(clean.slice(0, maxLen)) + "...";
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function pageInfo(paged: { page: number; hasMore: boolean; records: unknown[] }): string {
  const more = paged.hasMore ? ` | Page ${paged.page}, more available (next page: ${paged.page + 1})` : ` | Page ${paged.page}, no more results`;
  return `**${paged.records.length} results**${more}`;
}

// ---- Companies ----

export function formatCompanyList(paged: HuduPagedResponse<HuduCompany>): string {
  if (paged.records.length === 0) return "No companies found.";

  const rows = paged.records.map(
    (c) => `| ${c.id} | ${esc(c.name)} | ${esc(c.company_type)} | ${esc(c.city)} | ${esc(c.state)} | ${c.archived ? "Archived" : "Active"} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Type | City | State | Status |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatCompanyDetail(c: HuduCompany): string {
  return [
    `# Company: ${c.name}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${c.id} |`,
    `| Name | ${esc(c.name)} |`,
    `| Nickname | ${esc(c.nickname) || "-"} |`,
    `| Type | ${esc(c.company_type) || "-"} |`,
    `| Address | ${esc([c.address_line_1, c.address_line_2, c.city, c.state, c.zip].filter(Boolean).join(", ")) || "-"} |`,
    `| Country | ${esc(c.country_name) || "-"} |`,
    `| Phone | ${esc(c.phone_number) || "-"} |`,
    `| Website | ${esc(c.website) || "-"} |`,
    `| Parent | ${esc(c.parent_company_name) || "-"} (ID: ${c.parent_company_id ?? "-"}) |`,
    `| Status | ${c.archived ? "Archived" : "Active"} |`,
    `| Created | ${c.created_at ?? ""} |`,
    `| Updated | ${c.updated_at ?? ""} |`,
    ...(c.notes ? ["", "## Notes", "", truncate(c.notes, 2000)] : []),
  ].join("\n");
}

// ---- Assets ----

export function formatAssetList(paged: HuduPagedResponse<HuduAsset>): string {
  if (paged.records.length === 0) return "No assets found.";

  const rows = paged.records.map(
    (a) => `| ${a.id} | ${esc(a.name)} | ${esc(a.company_name) || a.company_id} | ${a.asset_layout_id} | ${esc(a.primary_serial)} | ${a.archived ? "Archived" : "Active"} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Company | Layout ID | Serial | Status |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatAssetDetail(a: HuduAsset): string {
  const lines = [
    `# Asset: ${a.name}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${a.id} |`,
    `| Name | ${esc(a.name)} |`,
    `| Company | ${esc(a.company_name) || a.company_id} |`,
    `| Layout ID | ${a.asset_layout_id} |`,
    `| Serial | ${esc(a.primary_serial) || "-"} |`,
    `| Model | ${esc(a.primary_model) || "-"} |`,
    `| Manufacturer | ${esc(a.primary_manufacturer) || "-"} |`,
    `| Status | ${a.archived ? "Archived" : "Active"} |`,
    `| Created | ${a.created_at ?? ""} |`,
    `| Updated | ${a.updated_at ?? ""} |`,
  ];

  if (a.url) {
    lines.push(`| Hudu URL | ${a.url} |`);
  }

  if (a.fields && a.fields.length > 0) {
    lines.push("", "## Custom Fields", "");
    for (const f of a.fields) {
      if (f.value !== null && f.value !== undefined && f.value !== "") {
        lines.push(`- **${f.label}**: ${f.value}`);
      }
    }
  }

  return lines.join("\n");
}

// ---- Asset Layouts ----

export function formatAssetLayoutList(paged: HuduPagedResponse<HuduAssetLayout>): string {
  if (paged.records.length === 0) return "No asset layouts found.";

  const rows = paged.records.map(
    (l) => `| ${l.id} | ${esc(l.name)} | ${l.fields?.length ?? 0} fields | ${l.active ? "Active" : "Inactive"} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Fields | Status |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatAssetLayoutDetail(l: HuduAssetLayout): string {
  const lines = [
    `# Asset Layout: ${l.name}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${l.id} |`,
    `| Name | ${esc(l.name)} |`,
    `| Icon | ${esc(l.icon) || "-"} |`,
    `| Color | ${esc(l.color) || "-"} |`,
    `| Active | ${l.active ? "Yes" : "No"} |`,
  ];

  if (l.fields && l.fields.length > 0) {
    lines.push("", "## Layout Fields", "");
    lines.push("| Position | Label | Type | Required | Show in List |");
    lines.push("|---|---|---|---|---|");
    const sorted = [...l.fields].sort((a, b) => a.position - b.position);
    for (const f of sorted) {
      lines.push(
        `| ${f.position} | ${esc(f.label)} | ${esc(f.field_type)} | ${f.required ? "Yes" : "No"} | ${f.show_in_list ? "Yes" : "No"} |`
      );
    }
  }

  return lines.join("\n");
}

// ---- Articles (Knowledge Base) ----

export function formatArticleList(paged: HuduPagedResponse<HuduArticle>): string {
  if (paged.records.length === 0) return "No articles found.";

  const rows = paged.records.map(
    (a) => `| ${a.id} | ${esc(a.name)} | ${a.company_id ?? "Global"} | ${a.draft ? "Draft" : "Published"} | ${a.updated_at ?? ""} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Title | Company ID | Status | Updated |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatArticleDetail(a: HuduArticle): string {
  const content = a.content ? stripHtml(a.content) : "No content.";
  return [
    `# KB Article: ${a.name}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${a.id} |`,
    `| Company ID | ${a.company_id ?? "Global"} |`,
    `| Folder ID | ${a.folder_id ?? "-"} |`,
    `| Status | ${a.draft ? "Draft" : "Published"} |`,
    `| Created | ${a.created_at ?? ""} |`,
    `| Updated | ${a.updated_at ?? ""} |`,
    ...(a.share_url ? [`| Share URL | ${a.share_url} |`] : []),
    "",
    "## Content",
    "",
    truncate(content, 4000),
  ].join("\n");
}

// ---- Expirations ----

export function formatExpirationList(paged: HuduPagedResponse<HuduExpiration>): string {
  if (paged.records.length === 0) return "No expirations found.";

  const rows = paged.records.map(
    (e) => `| ${e.id} | ${esc(e.expiration_type)} | ${esc(e.expirationable_type)}#${e.expirationable_id} | ${e.company_id ?? "-"} | ${e.date ?? ""} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Type | Resource | Company ID | Expiry Date |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Websites ----

export function formatWebsiteList(paged: HuduPagedResponse<HuduWebsite>): string {
  if (paged.records.length === 0) return "No websites found.";

  const rows = paged.records.map(
    (w) => `| ${w.id} | ${esc(w.name)} | ${esc(w.company_name)} | ${esc(w.url)} | ${w.paused ? "Paused" : "Active"} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Company | URL | Status |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Procedures (Processes) ----

export function formatProcedureList(paged: HuduPagedResponse<HuduProcedure>): string {
  if (paged.records.length === 0) return "No procedures found.";

  const rows = paged.records.map(
    (p) => `| ${p.id} | ${esc(p.name)} | ${esc(p.company_name) || "Global"} | ${p.completion_percentage ?? "-"} | ${p.updated_at ?? ""} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Company | Progress | Updated |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatProcedureDetail(p: HuduProcedure): string {
  return [
    `# Procedure: ${p.name}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${p.id} |`,
    `| Name | ${p.name} |`,
    `| Company | ${esc(p.company_name) || "Global"} |`,
    `| Progress | ${p.completed}/${p.total} (${p.completion_percentage ?? "-"}) |`,
    `| Created | ${p.created_at ?? ""} |`,
    `| Updated | ${p.updated_at ?? ""} |`,
    ...(p.description ? ["", "## Description", "", truncate(stripHtml(p.description), 3000)] : []),
  ].join("\n");
}

// ---- Activity Logs ----

export function formatActivityLogList(paged: HuduPagedResponse<HuduActivityLog>): string {
  if (paged.records.length === 0) return "No activity logs found.";

  const rows = paged.records.map(
    (l) => `| ${l.id} | ${l.created_at ?? ""} | ${esc(l.user_name) || esc(l.user_email)} | ${esc(l.action)} | ${esc(l.record_type)} | ${esc(l.record_name)} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Date | User | Action | Record Type | Record Name |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Folders ----

export function formatFolderList(paged: HuduPagedResponse<HuduFolder>): string {
  if (paged.records.length === 0) return "No folders found.";

  const rows = paged.records.map(
    (f) => `| ${f.id} | ${esc(f.name)} | ${f.company_id ?? "Global"} | ${f.parent_folder_id ?? "-"} | ${truncate(f.description, 60)} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Company ID | Parent | Description |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Users ----

export function formatUserList(paged: HuduPagedResponse<HuduUser>): string {
  if (paged.records.length === 0) return "No users found.";

  const rows = paged.records.map(
    (u) => `| ${u.id} | ${esc(`${u.first_name ?? ""} ${u.last_name ?? ""}`.trim())} | ${esc(u.email)} | ${esc(u.security_level)} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Email | Role |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Groups ----

export function formatGroupList(paged: HuduPagedResponse<HuduGroup>): string {
  if (paged.records.length === 0) return "No groups found.";

  const rows = paged.records.map(
    (g) => `| ${g.id} | ${esc(g.name)} | ${g.member_count} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Members |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Website Detail ----

export function formatWebsiteDetail(w: HuduWebsite): string {
  return [
    `# Website: ${esc(w.name)}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${w.id} |`,
    `| Name | ${esc(w.name)} |`,
    `| Company | ${esc(w.company_name) || "-"} |`,
    `| URL | ${esc(w.url) || "-"} |`,
    `| Status | ${esc(w.status) || "-"} |`,
    `| Monitoring | ${esc(w.monitoring_status) || "-"} |`,
    `| Paused | ${w.paused ? "Yes" : "No"} |`,
    `| DNS Monitoring | ${w.disable_dns ? "Disabled" : "Enabled"} |`,
    `| SSL Monitoring | ${w.disable_ssl ? "Disabled" : "Enabled"} |`,
    `| WHOIS Monitoring | ${w.disable_whois ? "Disabled" : "Enabled"} |`,
    `| DMARC Tracking | ${w.enable_dmarc_tracking ? "Enabled" : "Disabled"} |`,
    `| DKIM Tracking | ${w.enable_dkim_tracking ? "Enabled" : "Disabled"} |`,
    `| SPF Tracking | ${w.enable_spf_tracking ? "Enabled" : "Disabled"} |`,
    `| Created | ${w.created_at ?? ""} |`,
    `| Updated | ${w.updated_at ?? ""} |`,
    ...(w.notes ? ["", "## Notes", "", truncate(w.notes, 2000)] : []),
  ].join("\n");
}

// ---- Relations ----

export function formatRelationList(paged: HuduPagedResponse<HuduRelation>): string {
  if (paged.records.length === 0) return "No relations found.";

  const rows = paged.records.map(
    (r) => `| ${r.id} | ${esc(r.fromable_type)}#${r.fromable_id} | ${esc(r.toable_type)}#${r.toable_id} | ${truncate(r.description, 60)} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | From | To | Description |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Networks ----
// /networks and /ip_addresses return ALL records in one response, so these
// formatters take a plain array (not a paged wrapper).

export function formatNetworkList(records: HuduNetwork[]): string {
  if (records.length === 0) return "No networks found.";

  const rows = records.map(
    (n) => `| ${n.id} | ${esc(n.name)} | ${esc(n.address)} | ${n.network_type ?? "-"} | ${n.company_id} | ${n.vlan_id ?? "-"} |`
  );

  return [
    `**${records.length} networks**`,
    "",
    "| ID | Name | Address | Type | Company ID | VLAN ID |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatIpAddressList(records: HuduIpAddress[]): string {
  if (records.length === 0) return "No IP addresses found.";

  const rows = records.map(
    (ip) => `| ${ip.id} | ${esc(ip.address)} | ${esc(ip.status)} | ${esc(ip.asset_name)} | ${ip.asset_id ?? "-"} | ${truncate(ip.description, 60)} |`
  );

  return [
    `**${records.length} IP addresses**`,
    "",
    "| ID | Address | Status | Asset | Asset ID | Description |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// VLANs are returned as a bare array (no pagination).

export function formatVlanList(records: HuduVlan[]): string {
  if (records.length === 0) return "No VLANs found.";

  const rows = records.map(
    (v) => `| ${v.id} | ${v.vlan_id ?? "-"} | ${esc(v.name)} | ${v.company_id} | ${v.vlan_zone_id ?? "-"} | ${v.networks_count ?? "-"} |`
  );

  return [
    `**${records.length} VLANs**`,
    "",
    "| ID | VLAN # | Name | Company ID | Zone ID | Networks |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatVlanDetail(v: HuduVlan): string {
  return [
    `# VLAN: ${esc(v.name) || v.id}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${v.id} |`,
    `| Name | ${esc(v.name) || "-"} |`,
    `| VLAN # | ${v.vlan_id ?? "-"} |`,
    `| Company ID | ${v.company_id} |`,
    `| Zone ID | ${v.vlan_zone_id ?? "-"} |`,
    `| Status (list item) | ${v.status_list_item_id ?? "-"} |`,
    `| Role (list item) | ${v.role_list_item_id ?? "-"} |`,
    `| Networks count | ${v.networks_count ?? "-"} |`,
    `| Hudu URL | ${esc(v.url) || "-"} |`,
    `| Archived | ${v.archived_at ?? "No"} |`,
    `| Created | ${v.created_at ?? ""} |`,
    `| Updated | ${v.updated_at ?? ""} |`,
    ...(v.description ? ["", "## Description", "", truncate(v.description, 2000)] : []),
    ...(v.notes ? ["", "## Notes", "", truncate(v.notes, 2000)] : []),
  ].join("\n");
}

// ---- VLAN Zones ----

export function formatVlanZoneList(records: HuduVlanZone[]): string {
  if (records.length === 0) return "No VLAN Zones found.";

  const rows = records.map(
    (z) => `| ${z.id} | ${esc(z.name)} | ${z.company_id} | ${esc(z.vlan_id_ranges)} | ${z.vlans_count ?? "-"} |`
  );

  return [
    `**${records.length} VLAN Zones**`,
    "",
    "| ID | Name | Company ID | VLAN ID Ranges | VLANs |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatVlanZoneDetail(z: HuduVlanZone): string {
  return [
    `# VLAN Zone: ${esc(z.name) || z.id}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${z.id} |`,
    `| Name | ${esc(z.name) || "-"} |`,
    `| Company ID | ${z.company_id} |`,
    `| VLAN ID Ranges | ${esc(z.vlan_id_ranges) || "-"} |`,
    `| VLANs count | ${z.vlans_count ?? "-"} |`,
    `| Hudu URL | ${esc(z.url) || "-"} |`,
    `| Archived | ${z.archived_at ?? "No"} |`,
    `| Created | ${z.created_at ?? ""} |`,
    `| Updated | ${z.updated_at ?? ""} |`,
    ...(z.description ? ["", "## Description", "", truncate(z.description, 2000)] : []),
  ].join("\n");
}

// ---- Flags ----

export function formatFlagList(paged: HuduPagedResponse<HuduFlag>): string {
  if (paged.records.length === 0) return "No flags found.";

  const rows = paged.records.map(
    (f) => `| ${f.id} | ${f.flag_type_id} | ${esc(f.flagable_type)}#${f.flagable_id} | ${truncate(f.description, 60)} | ${f.created_at ?? ""} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Flag Type ID | Flagged Record | Description | Created |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatFlagDetail(f: HuduFlag): string {
  return [
    `# Flag: ${f.id}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${f.id} |`,
    `| Flag Type ID | ${f.flag_type_id} |`,
    `| Flagged Record | ${esc(f.flagable_type)}#${f.flagable_id} |`,
    `| Created | ${f.created_at ?? ""} |`,
    `| Updated | ${f.updated_at ?? ""} |`,
    ...(f.description ? ["", "## Description", "", truncate(f.description, 2000)] : []),
  ].join("\n");
}

// ---- Flag Types ----

export function formatFlagTypeList(paged: HuduPagedResponse<HuduFlagType>): string {
  if (paged.records.length === 0) return "No flag types found.";

  const rows = paged.records.map(
    (t) => `| ${t.id} | ${esc(t.name)} | ${esc(t.color)} | ${esc(t.slug)} | ${t.updated_at ?? ""} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Color | Slug | Updated |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatFlagTypeDetail(t: HuduFlagType): string {
  return [
    `# Flag Type: ${esc(t.name)}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${t.id} |`,
    `| Name | ${esc(t.name)} |`,
    `| Color | ${esc(t.color)} |`,
    `| Slug | ${esc(t.slug) || "-"} |`,
    `| Created | ${t.created_at ?? ""} |`,
    `| Updated | ${t.updated_at ?? ""} |`,
  ].join("\n");
}

// ---- Procedure Tasks ----

export function formatProcedureTaskList(records: HuduProcedureTask[]): string {
  if (records.length === 0) return "No procedure tasks found.";

  const rows = records.map(
    (t) => `| ${t.id} | ${esc(t.name)} | ${t.procedure_id} | ${t.position ?? "-"} | ${esc(t.priority) || "-"} | ${t.completed ? "Yes" : "No"} | ${esc(t.formatted_due_date) || "-"} |`
  );

  return [
    `**${records.length} procedure tasks**`,
    "",
    "| ID | Name | Procedure ID | Position | Priority | Completed | Due |",
    "|---|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatProcedureTaskDetail(t: HuduProcedureTask): string {
  const lines = [
    `# Procedure Task: ${esc(t.name)}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${t.id} |`,
    `| Name | ${esc(t.name)} |`,
    `| Procedure ID | ${t.procedure_id} |`,
    `| Position | ${t.position ?? "-"} |`,
    `| Priority | ${esc(t.priority) || "-"} |`,
    `| Completed | ${t.completed ? "Yes" : "No"} |`,
    `| Completed Date | ${esc(t.completed_date) || "-"} |`,
    `| Due Date | ${esc(t.formatted_due_date) || "-"} |`,
    `| Completed By | ${esc(t.user_name) || "-"} (ID: ${t.user_id ?? "-"}) |`,
    `| Assigned (count) | ${t.assigned_users?.length ?? 0} |`,
    `| First Assigned | ${esc(t.first_assigned_user_name) || "-"} (ID: ${t.first_assigned_user_id ?? "-"}) |`,
    `| Optional | ${t.optional ? "Yes" : "No"} |`,
    `| Parent Task ID | ${t.parent_task_id ?? "-"} |`,
    `| Subtask Count | ${t.subtask_count ?? 0} |`,
    `| Hudu URL | ${esc(t.url) || "-"} |`,
    `| Created | ${t.created_at ?? ""} |`,
    `| Updated | ${t.updated_at ?? ""} |`,
  ];

  if (t.description) {
    lines.push("", "## Description", "", truncate(t.description, 3000));
  }
  if (t.completion_notes) {
    lines.push("", "## Completion Notes", "", truncate(t.completion_notes, 2000));
  }

  return lines.join("\n");
}

// ---- Network / IP detail ----

export function formatNetworkDetail(n: HuduNetwork): string {
  return [
    `# Network: ${esc(n.name) || n.id}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${n.id} |`,
    `| Name | ${esc(n.name) || "-"} |`,
    `| Company ID | ${n.company_id ?? "-"} |`,
    `| Address | ${esc(n.address) || "-"} |`,
    `| Type | ${n.network_type ?? "-"} |`,
    `| VLAN ID | ${n.vlan_id ?? "-"} |`,
    `| Location ID | ${n.location_id ?? "-"} |`,
    `| Status (list item) | ${n.status_list_item_id ?? "-"} |`,
    `| Role (list item) | ${n.role_list_item_id ?? "-"} |`,
    `| Hudu URL | ${esc(n.url) || "-"} |`,
    `| Archived | ${n.archived_at ?? "No"} |`,
    `| Created | ${n.created_at ?? ""} |`,
    `| Updated | ${n.updated_at ?? ""} |`,
    ...(n.description ? ["", "## Description", "", truncate(n.description, 2000)] : []),
    ...(n.notes ? ["", "## Notes", "", truncate(n.notes, 2000)] : []),
  ].join("\n");
}

export function formatIpAddressDetail(ip: HuduIpAddress): string {
  return [
    `# IP Address: ${esc(ip.address) || ip.id}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${ip.id} |`,
    `| Address | ${esc(ip.address) || "-"} |`,
    `| Company ID | ${ip.company_id ?? "-"} |`,
    `| Status | ${esc(ip.status) || "-"} |`,
    `| Asset | ${esc(ip.asset_name) || "-"} (ID: ${ip.asset_id ?? "-"}) |`,
    `| Asset URL | ${esc(ip.asset_url) || "-"} |`,
    `| FQDN | ${esc(ip.fqdn) || "-"} |`,
    `| Hudu URL | ${esc(ip.url) || "-"} |`,
    `| Discarded | ${ip.discarded_at ?? "No"} |`,
    `| Created | ${ip.created_at ?? ""} |`,
    `| Updated | ${ip.updated_at ?? ""} |`,
    ...(ip.description ? ["", "## Description", "", truncate(ip.description, 2000)] : []),
    ...(ip.notes ? ["", "## Notes", "", truncate(ip.notes, 2000)] : []),
  ].join("\n");
}

// ---- Lists ----

export function formatListList(paged: HuduPagedResponse<HuduList>): string {
  if (paged.records.length === 0) return "No lists found.";

  const rows = paged.records.map(
    (l) => `| ${l.id} | ${esc(l.name)} | ${l.list_items?.length ?? "-"} | ${l.updated_at ?? ""} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Items | Updated |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function formatListDetail(l: HuduList): string {
  const lines = [
    `# List: ${esc(l.name)}`,
    "",
    "| Field | Value |",
    "|---|---|",
    `| ID | ${l.id} |`,
    `| Name | ${esc(l.name)} |`,
    `| Created | ${l.created_at ?? ""} |`,
    `| Updated | ${l.updated_at ?? ""} |`,
  ];

  if (l.description) {
    lines.push("", "## Description", "", truncate(l.description, 2000));
  }

  if (l.list_items && l.list_items.length > 0) {
    lines.push("", "## Items", "");
    lines.push("| ID | Name |");
    lines.push("|---|---|");
    for (const item of l.list_items) {
      lines.push(`| ${item.id} | ${esc(item.name)} |`);
    }
  }

  return lines.join("\n");
}

// ---- Password Folders ----

export function formatPasswordFolderList(paged: HuduPagedResponse<HuduPasswordFolder>): string {
  if (paged.records.length === 0) return "No password folders found.";

  const rows = paged.records.map(
    (f) => `| ${f.id} | ${esc(f.name)} | ${f.company_id ?? "Global"} | ${f.parent_password_folder_id ?? "-"} | ${truncate(f.description, 60)} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Company ID | Parent | Description |",
    "|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- Uploads ----

export function formatUploadList(paged: HuduPagedResponse<HuduUpload>): string {
  if (paged.records.length === 0) return "No uploads found.";

  const rows = paged.records.map(
    (u) => `| ${u.id} | ${esc(u.name)} | ${esc(u.uploadable_type)}#${u.uploadable_id ?? "-"} | ${esc(u.mime) || "-"} | ${esc(u.size) || "-"} | ${esc(u.created_date) || "-"} |`
  );

  return [
    pageInfo(paged),
    "",
    "| ID | Name | Parent | MIME | Size | Created |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

// ---- App Info ----

export function formatAppInfo(info: HuduAppInfo): string {
  return [
    "# Hudu API Info",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Version | ${esc(info.version)} |`,
    `| Date | ${esc(info.date)} |`,
  ].join("\n");
}

export function formatMagicDashList(widgets: HuduMagicDash[]): string {
  if (widgets.length === 0) return "No Magic Dash widgets found.";

  const rows = widgets.map(
    (w) =>
      `| ${w.id} | ${esc(w.title)} | ${esc(w.company_name)} | ${w.company_id ?? ""} | ${w.shade ?? ""} | ${truncate(w.message, 60)} |`
  );

  return [
    `**${widgets.length} Magic Dash widget${widgets.length === 1 ? "" : "s"}**`,
    "",
    "| ID | Title | Company | Company ID | Shade | Message |",
    "|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}
