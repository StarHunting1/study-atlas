import Anthropic from "@anthropic-ai/sdk";
import type { AiExtraction, AiFact, CollectedRecord } from "./types";
import { normalize } from "./util";
/*
 * Optional AI step: extract key facts and write ja/en summaries from an official page's text.
 * Guard rails: the output is never trusted as verified. Every fact must carry a verbatim quote that exists in the
 * source text, and any number it states must appear in that quote; otherwise it is rejected and listed for review.
 * Runs only when ANTHROPIC_API_KEY is set (GitHub Secret) and --ai is passed.
 */
export const AI_MODEL = "claude-opus-5-5";
const SCHEMA = {
  type: "object", additionalProperties: false, required: ["summary_en", "summary_ja", "facts"],
  properties: {
    summary_en: { type: "string" }, summary_ja: { type: "string" },
    facts: { type: "array", items: { type: "object", additionalProperties: false, required: ["name", "value", "unit", "currency", "applies_to", "quote"],
      properties: { name: { type: "string" }, value: { type: "string" }, unit: { type: "string" }, currency: { type: "string" }, applies_to: { type: "string" }, quote: { type: "string" } } } },
  },
} as const;
const SYSTEM = `You extract facts for international students from an official government page.
Rules:
- Use only the page text provided. Never add knowledge from elsewhere.
- For every fact, "quote" must be copied character-for-character from the page text and must contain the value.
- Prefer amounts, durations, eligibility conditions and who a rule applies to. Use "" for unknown unit/currency/applies_to.
- Summaries: 2-4 sentences, plain language; Japanese summary in natural Japanese. Do not state anything the page does not say.`;

const numbersIn = (s: string) => (s.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, ""));
/** Keep only facts whose quote is in the source and whose numbers are in the quote. */
export function checkFacts(facts: AiFact[], sourceText: string): Pick<AiExtraction, "facts" | "rejected"> {
  const src = normalize(sourceText); const ok: AiFact[] = []; const rejected: AiExtraction["rejected"] = [];
  for (const f of facts) {
    const q = normalize(f.quote ?? "");
    if (!q || !src.includes(q)) { rejected.push({ fact: f, reason: "quote not found in source text" }); continue; }
    const missing = numbersIn(f.value).filter((n) => !numbersIn(f.quote).includes(n));
    if (missing.length) { rejected.push({ fact: f, reason: `number(s) ${missing.join(", ")} not in quote` }); continue; }
    ok.push(f);
  }
  return { facts: ok, rejected };
}

export async function extract(record: CollectedRecord, text: string, now: string, client = new Anthropic()): Promise<AiExtraction | { error: string }> {
  const response = await client.beta.messages.create({
    model: AI_MODEL, max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"], fallbacks: "default", // re-run on a fallback model if a safety classifier declines
    output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> } },
    system: SYSTEM,
    messages: [{ role: "user", content: `Page: ${record.sourceUrl}\nTopic: ${record.field}\n\n<page_text>\n${text}\n</page_text>` }],
  });
  if (response.stop_reason === "refusal") return { error: "model declined (refusal)" };
  if (response.stop_reason === "max_tokens") return { error: "output truncated (max_tokens)" };
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return { error: "no text output" };
  let parsed: { summary_en: string; summary_ja: string; facts: { name: string; value: string; unit: string; currency: string; applies_to: string; quote: string }[] };
  try { parsed = JSON.parse(block.text); } catch { return { error: "invalid JSON output" }; }
  const facts: AiFact[] = parsed.facts.map((f) => ({ name: f.name, value: f.value, unit: f.unit || undefined, currency: f.currency || undefined, appliesTo: f.applies_to || undefined, quote: f.quote }));
  return { model: response.model, generatedAt: now, summary: { en: parsed.summary_en, ja: parsed.summary_ja }, ...checkFacts(facts, text) };
}
