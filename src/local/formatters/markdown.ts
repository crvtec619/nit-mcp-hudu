import type { HuduMagicDash, HuduArticle } from "../../types";

export function formatMagicDashResult(m: HuduMagicDash): string {
  const lines: string[] = [
    `**Magic Dash widget saved** (id: ${m.id})`,
    "",
    `- **Company:** ${m.company_name ?? "—"} (${m.company_id ?? "—"})`,
    `- **Title:** ${m.title}`,
  ];
  if (m.shade) lines.push(`- **Shade:** ${m.shade}`);
  if (m.icon) lines.push(`- **Icon:** ${m.icon}`);
  if (m.content_link) lines.push(`- **Link:** ${m.content_link}`);
  // Hudu's magic_dash POST response doesn't include timestamps; omit if missing.
  if (m.updated_at) lines.push(`- **Updated at:** ${m.updated_at}`);
  return lines.join("\n");
}

export function formatMagicDashDeleteResult(id: number): string {
  return `**Magic Dash widget deleted** (id: ${id})`;
}

export function formatArticleCreateResult(a: HuduArticle): string {
  const lines: string[] = [
    `**Article created** (id: ${a.id})`,
    "",
    `- **Name:** ${a.name}`,
    `- **Company ID:** ${a.company_id ?? "—"}`,
    `- **Folder ID:** ${a.folder_id ?? "—"}`,
    `- **Draft:** ${a.draft}`,
    `- **Sharing enabled:** ${a.enable_sharing ?? false}`,
  ];
  if (a.share_url) lines.push(`- **Share URL:** ${a.share_url}`);
  if (a.url) lines.push(`- **Internal URL:** ${a.url}`);
  lines.push(`- **Created at:** ${a.created_at}`);
  return lines.join("\n");
}

export function formatArticleUpdateResult(a: HuduArticle): string {
  const lines: string[] = [
    `**Article updated** (id: ${a.id})`,
    "",
    `- **Name:** ${a.name}`,
    `- **Company ID:** ${a.company_id ?? "—"}`,
    `- **Folder ID:** ${a.folder_id ?? "—"}`,
    `- **Archived:** ${a.archived}`,
    `- **Updated at:** ${a.updated_at}`,
  ];
  return lines.join("\n");
}

export function formatArticleArchiveResult(id: number, archived: boolean): string {
  return archived
    ? `**Article archived** (id: ${id}). Use hudu_unarchive_article to restore.`
    : `**Article unarchived** (id: ${id}).`;
}

export function formatArticleDeleteResult(id: number): string {
  return `**Article deleted** (id: ${id}).`;
}
