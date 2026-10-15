/*
 * TEMPORARY (Ver.1.3.3): reads the public pages that decide which language schools may be listed, and the current dates of the
 * government pages we paraphrase. One request per URL, no retries, robots.txt respected, one request at a time, nothing stored.
 * Never requests metoffice.gov.uk / translink.ca / ubc.ca (rights records forbid automated access). Removed after the results are recorded.
 */
import { makeRobots } from "./robots";
import { fetchText, htmlToText, sleep, USER_AGENT } from "./util";
const robots = makeRobots((u) => fetchText(u, { accept: "text/plain", retries: 0 }), USER_AGENT);
const short = (t: string, n = 220) => t.replace(/\s+/g, " ").trim().slice(0, n);
const get = async (url: string, accept = "text/html,*/*;q=0.8") => { await sleep(1500); try { return await fetchText(url, { retries: 0, accept }); } catch (e) { return { status: 0, url, contentType: "", body: `ERROR ${(e as Error).message} ${((e as { cause?: Error }).cause?.message) ?? ""}` }; } };
const ctx = (text: string, re: RegExp, w = 90, max = 3) => [...text.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))].slice(0, max).map((m) => short(text.slice(Math.max(0, (m.index ?? 0) - w), (m.index ?? 0) + m[0].length + w), 2 * w + m[0].length));
const MPC = /\bM\d{1,2}\s?\d[A-Z]{2}\b/, VPC = /\bV\d[A-Z]\s?\d[A-Z]\d\b/;
async function school(url: string, opts: { pc?: RegExp; extra?: RegExp[] } = {}) {
  const rb = await robots(url); if (!rb.allowed) { console.log(`- ${url}\n  robots: ${rb.reason} (not fetched)`); return; }
  const r = await get(url); const text = htmlToText(r.body).replace(/\s+/g, " ");
  console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 110)}”`);
  if (r.status !== 200) return;
  for (const [label, re] of [["address", opts.pc ?? MPC], ["accommodation", /homestay|home stay|residence|accommodation|host family/i], ["general english", /general english/i], ["accreditation", /british council|english uk|accreditation uk|languages canada|accredited/i], ["closed/moved", /closed|closure|ceased|relocat|moved to|no longer/i], ...(opts.extra ?? []).map((e) => [String(e), e] as [string, RegExp])] as [string, RegExp][]) {
    const h = ctx(text, re, 70, 2); console.log(`  ${label}: ${h.length ? h.map((x) => `…${x}…`).join(" | ") : "none"}`);
  }
  console.log("  fee links:", [...new Set([...r.body.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)].filter((m) => /fee|price|pricing|cost|tuition/i.test(m[1] + " " + htmlToText(m[2]))).map((m) => { try { return new URL(m[1].replace(/&amp;/g, "&"), r.url).toString(); } catch { return ""; } }).filter(Boolean))].slice(0, 6).join(" ") || "none");
}
async function directory(url: string) {
  const r = await get(url); const text = htmlToText(r.body).replace(/\s+/g, " "); console.log(`- ${url}\n  ${r.status} → ${r.url} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 100)}”`);
  if (r.status !== 200) return;
  console.log("  name/address:", ctx(text, /Address\s/i, 10, 1).concat(ctx(text, MPC, 120, 1)).join(" | ") || "none");
  console.log("  website:", ctx(text, /Website/i, 60, 2).join(" | ") || "none", "| links:", [...new Set([...r.body.matchAll(/href="(https?:\/\/(?!www\.englishuk)[^"]+)"/gi)].map((m) => m[1]).filter((h) => !/facebook|twitter|linkedin|youtube|instagram|websitemanager|google/i.test(h)))].slice(0, 4).join(" "));
  console.log("  accommodation:", ctx(text, /Homestay|Residential|Hotel or Hostel|Accommodation/i, 80, 3).join(" | ") || "none", "| img alts:", [...r.body.matchAll(/alt="([^"]{2,40})"/gi)].map((m) => m[1]).filter((a) => /tick|cross|yes|no|homestay|campus|hotel/i.test(a)).slice(0, 8).join(", "));
}
(async () => {
  console.log("## R2-A. Express English College: its own site vs the English UK entry");
  await directory("https://www.englishuk.com/member-directory?id=6665");
  for (const u of ["https://expressenglishcollege.co.uk/contact/", "https://expressenglishcollege.co.uk/courses/", "https://expressenglishcollege.co.uk/school-accreditations-and-members/"]) await school(u, { extra: [/Princess Road/i, /fees|prices/i] });
  console.log("\n## R2-B. Vancouver: address on the school's announcement, Languages Canada listing of EF");
  await school("https://ihvancouver.com/2024/11/08/new-campus/", { pc: VPC, extra: [/Quayside/i, /New Westminster/i, /February|2025/i] });
  await school("https://www.languagescanada.ca/en/listing-directory/students/ef-international-language-schools-canada-vancouver", { pc: VPC, extra: [/Cambie/i, /Type of Accommodation[^.]{0,60}/i] });
  await school("https://ihvancouver.com/ihv-price-list/", { pc: VPC, extra: [/price list/i] });
  console.log("\n## R2-C. Terms of use of the government sites (licence column of the approval record)");
  for (const u of ["https://www.canada.ca/en/transparency/terms.html", "https://www2.gov.bc.ca/gov/content/home/copyright", "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"]) {
    const rb = await robots(u); if (!rb.allowed) { console.log(`- ${u}\n  robots: ${rb.reason}`); continue; }
    const r = await get(u); const text = htmlToText(r.body).replace(/\s+/g, " "); console.log(`- ${u}\n  ${r.status} · “${short(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(r.body)?.[1] ?? "", 90)}”`);
    for (const re of [/commercial/i, /reproduc/i, /without (charge|permission|seeking)/i, /attribution|acknowledg/i]) console.log(`  ${re.source}: ${ctx(text, re, 110, 2).join(" | ") || "none"}`);
  }
})();
