import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import type { LocaleContent, SiteContent } from "./types";

const CONTENT_FILE = path.join(process.cwd(), "content", "content.md");

/**
 * content.md is a readable document: prose for humans, one fenced ```yaml
 * block per locale under a "## de" / "## en" heading for the machine.
 * Everything outside those blocks is commentary and ignored.
 */
function extractLocaleBlocks(markdown: string): Partial<Record<Locale, string>> {
  const blocks: Partial<Record<Locale, string>> = {};
  const sectionRe = /^##\s+(de|en)\b[^\n]*\n([\s\S]*?)(?=^##\s+(?:de|en)\b|\s*$(?![\s\S]))/gm;
  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(markdown)) !== null) {
    const locale = match[1] as Locale;
    const yamlMatch = match[2].match(/```ya?ml\s*\n([\s\S]*?)\n```/);
    if (yamlMatch) blocks[locale] = yamlMatch[1];
  }
  return blocks;
}

let cache: { mtime: number; content: SiteContent } | null = null;

export async function loadDevContent(): Promise<SiteContent> {
  const { stat } = await import("node:fs/promises");
  const info = await stat(CONTENT_FILE);
  if (cache && cache.mtime === info.mtimeMs) return cache.content;

  const markdown = await readFile(CONTENT_FILE, "utf8");
  const blocks = extractLocaleBlocks(markdown);
  const content = {} as SiteContent;
  for (const locale of locales) {
    const source = blocks[locale];
    if (!source) throw new Error(`content.md: missing "## ${locale}" yaml block`);
    const parsed = loadYaml(source) as Omit<LocaleContent, "locale">;
    content[locale] = { ...parsed, locale };
  }
  cache = { mtime: info.mtimeMs, content };
  return content;
}
