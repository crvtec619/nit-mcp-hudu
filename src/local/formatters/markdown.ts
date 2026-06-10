import type {
  HuduAsset,
  HuduAssetLayout,
  HuduArticle,
  HuduNetwork,
  HuduIpAddress,
  HuduVlan,
  HuduVlanZone,
  HuduMagicDash,
  HuduRelation,
  HuduFolder,
  HuduList,
  HuduFlag,
  HuduFlagType,
  HuduProcedure,
  HuduProcedureTask,
} from "../../types";

type Verb = "created" | "updated" | "saved";

function header(entity: string, verb: Verb, id: number | undefined): string {
  return `**${entity} ${verb}** (id: ${id ?? "?"})`;
}

function row(label: string, value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return `- **${label}:** ${value}`;
}

function block(headerLine: string, rows: (string | null)[]): string {
  return [headerLine, "", ...rows.filter((r): r is string => r !== null)].join("\n");
}

export function formatAssetWriteResult(a: HuduAsset, verb: Verb): string {
  return block(header("Asset", verb, a.id), [
    row("Name", a.name),
    row("Company ID", a.company_id),
    row("Layout ID", a.asset_layout_id),
    row("Fields", a.fields?.length ? `${a.fields.length} populated` : null),
    row("URL", a.url),
  ]);
}

export function formatAssetLayoutWriteResult(l: HuduAssetLayout, verb: Verb): string {
  return block(header("Asset layout", verb, l.id), [
    row("Name", l.name),
    row("Active", l.active),
    row("Fields", l.fields?.length ? `${l.fields.length} defined` : null),
  ]);
}

export function formatArticleWriteResult(a: HuduArticle, verb: Verb): string {
  return block(header("Article", verb, a.id), [
    row("Name", a.name),
    row("Company ID", a.company_id),
    row("Folder ID", a.folder_id),
    row("Draft", a.draft),
    row("URL", a.url),
  ]);
}

export function formatNetworkWriteResult(n: HuduNetwork, verb: Verb): string {
  return block(header("Network", verb, n.id), [
    row("Name", n.name),
    row("Address", n.address),
    row("Company ID", n.company_id),
    row("VLAN ID", n.vlan_id),
    row("URL", n.url),
  ]);
}

export function formatIpAddressWriteResult(ip: HuduIpAddress, verb: Verb): string {
  return block(header("IP address", verb, ip.id), [
    row("Address", ip.address),
    row("Status", ip.status),
    row("Company ID", ip.company_id),
    row("Asset ID", ip.asset_id),
    row("FQDN", ip.fqdn),
  ]);
}

export function formatVlanWriteResult(v: HuduVlan, verb: Verb): string {
  return block(header("VLAN", verb, v.id), [
    row("Name", v.name),
    row("VLAN number", v.vlan_id),
    row("Company ID", v.company_id),
    row("Zone ID", v.vlan_zone_id),
  ]);
}

export function formatVlanZoneWriteResult(z: HuduVlanZone, verb: Verb): string {
  return block(header("VLAN zone", verb, z.id), [
    row("Name", z.name),
    row("Ranges", z.vlan_id_ranges),
    row("Company ID", z.company_id),
  ]);
}

export function formatMagicDashWriteResult(m: HuduMagicDash): string {
  return block(header("Magic Dash widget", "saved", m.id), [
    row("Title", m.title),
    row("Company", m.company_name),
    row("Shade", m.shade),
    row("Icon", m.icon),
    row("Link", m.content_link),
  ]);
}

export function formatFolderWriteResult(f: HuduFolder, verb: Verb): string {
  return block(header("Folder", verb, f.id), [
    row("Name", f.name),
    row("Company ID", f.company_id),
    row("Parent folder ID", f.parent_folder_id ?? "(top level)"),
    row("Description", f.description),
  ]);
}

export function formatRelationWriteResult(r: HuduRelation): string {
  return block(header("Relation", "created", r.id), [
    row("From", `${r.fromable_type} #${r.fromable_id}`),
    row("To", `${r.toable_type} #${r.toable_id}`),
    row("Description", r.description),
  ]);
}

export function formatListWriteResult(l: HuduList, verb: Verb): string {
  return block(header("List", verb, l.id), [
    row("Name", l.name),
    row("Items", l.list_items?.length ?? null),
    row("Description", l.description),
  ]);
}

export function formatFlagWriteResult(f: HuduFlag): string {
  return block(header("Flag", "created", f.id), [
    row("Type ID", f.flag_type_id),
    row("On", `${f.flagable_type} #${f.flagable_id}`),
    row("Description", f.description),
  ]);
}

export function formatFlagDeleteResult(id: number): string {
  return `**Flag removed** (id: ${id}).`;
}

export function formatFlagTypeWriteResult(t: HuduFlagType, verb: Verb): string {
  return block(header("Flag type", verb, t.id), [
    row("Name", t.name),
    row("Color", t.color),
  ]);
}

export function formatArchiveResult(label: string, id: number, archived: boolean): string {
  return archived
    ? `**${label} archived** (id: ${id}). Reversible — use the matching unarchive tool to restore.`
    : `**${label} unarchived** (id: ${id}).`;
}

export function formatProcedureWriteResult(p: HuduProcedure, verb: Verb): string {
  return block(header("Procedure", verb, p.id), [
    row("Name", p.name),
    row("Company", p.company_name),
    row("Tasks", p.total),
  ]);
}

export function formatProcedureTaskWriteResult(t: HuduProcedureTask, verb: Verb): string {
  return block(header("Procedure task", verb, t.id), [
    row("Name", t.name),
    row("Procedure ID", t.procedure_id),
    row("Position", t.position),
    row("Completed", t.completed),
  ]);
}
