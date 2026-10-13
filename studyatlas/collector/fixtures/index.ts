import { readFileSync } from "node:fs";
import path from "node:path";
/*
 * LOCAL TEST FIXTURES. Synthetic responses shaped like the real APIs, used by `--fixtures` and the tests.
 * Every value is invented and marked "[FIXTURE]"; nothing here came from GOV.UK or open.canada.ca.
 */
const DIR = path.resolve(process.cwd(), "collector/fixtures/data");
const routes: [RegExp, string][] = [
  [/^https:\/\/www\.gov\.uk\/api\/content\/student-visa$/, "govuk-student-visa.json"],
  [/^https:\/\/www\.gov\.uk\/api\/content\/healthcare-immigration-application$/, "govuk-healthcare.json"],
  [/^https:\/\/open\.canada\.ca\/data\/api\/action\/package_search\?q=rental/, "canada-housing.json"],
  [/^https:\/\/open\.canada\.ca\/data\/api\/action\/package_search\?q=Canadian/, "canada-climate.json"],
];
export async function fixtureFetch(url: string): Promise<unknown> {
  const hit = routes.find(([re]) => re.test(url));
  if (!hit) throw new Error(`HTTP 404 for ${url} (no fixture)`);
  return JSON.parse(readFileSync(path.join(DIR, hit[1]), "utf8"));
}
