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
  console.log("## A. GOV.UK Content API – current dates of the pages we paraphrase (OGL v3.0)");
  for (const p of ["visa-to-study-english", "standard-visitor/visit-to-study", "healthcare-immigration-application/how-much-pay", "student-visa", "check-uk-visa"]) {
    const r = await get(`https://www.gov.uk/api/content/${p}`, "application/json");
    try { const j = JSON.parse(r.body); console.log(`- ${p}: public_updated_at=${j.public_updated_at} first_published_at=${j.first_published_at} title=${j.title} | ${short(JSON.stringify(j.details?.change_description ?? j.details?.change_history?.[0] ?? ""), 160)}`); } catch { console.log(`- ${p}`, r.status, short(r.body, 120)); }
  }
  console.log("\n## B. canada.ca / BC pages – modification dates");
  for (const u of ["https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23", "https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students"]) {
    const r = await get(u); const text = htmlToText(r.body).replace(/\s+/g, " "); console.log(`- ${u}\n  ${r.status} dates:`, ctx(text, /(date modified|last updated|last modified|page last|updated)[^a-z]{0,3}[:\s]\s*[A-Za-z0-9 ,-]{6,30}/i, 20, 3).join(" | ") || "none", "| meta:", [...r.body.matchAll(/<meta[^>]+(?:dcterms\.modified|dcterms\.issued|last-modified|article:modified_time)[^>]*>/gi)].map((m) => short(m[0], 120)).slice(0, 3).join(" "));
  }
  console.log("\n## C. English UK directory entries");
  for (const u of ["https://www.englishuk.com/member-directory?id=4137", "https://www.englishuk.com/member-directory?id=878", "https://www.englishuk.com/member-directory?id=897", "https://www.englishuk.com/en/course-finder/course-finder-results?id=878", "https://www.englishuk.com/en/course-finder/course-finder-results?id=897"]) await directory(u);
  console.log("\n## D. Manchester school sites");
  for (const u of ["https://ihmanchester.com/", "https://ihmanchester.com/our-english-school/", "https://www.kaplaninternational.com/language-schools/united-kingdom/manchester", "https://ecenglish.com/en/schools/uk/learn-english-in-manchester/"]) await school(u);
  console.log("\n## E. British Council accredited centres index");
  for (const l of ["m", "e", "i", "k"]) { const u = `https://www.britishcouncil.org/education/accreditation/centres/${l}`; const rb = await robots(u); if (!rb.allowed) { console.log(u, "robots:", rb.reason); continue; } const r = await get(u); const text = htmlToText(r.body).replace(/\s+/g, " "); console.log(`- ${u}\n  ${r.status}`, r.status === 200 ? ctx(text, /manchester/i, 60, 8).join(" | ") : short(r.body, 80)); }
  console.log("\n## F. Vancouver school sites and Languages Canada");
  await school("https://ihvancouver.com/2024/11/08/new-campus/", { pc: VPC });
  await school("https://www.sprachcaffe.com/en/uc/adults/canada/vancouver.htm", { pc: VPC });
  await school("https://www.ef.com/ca/campaign/ilsd/canada/vancouver/", { pc: VPC });
  await school("https://www.languagescanada.ca/en/listing-directory/students/international-house-vancouver", { pc: VPC });
  for (const q of ["Sprachcaffe", "EF International", "International House"]) { const u = `https://www.languagescanada.ca/en/students-new?listing_filter_6%5Btitle%5D=${encodeURIComponent(q)}&listing_filter_6%5Bsave%5D=Filter`; const rb = await robots(u); if (!rb.allowed) { console.log(u, "robots:", rb.reason); continue; } const r = await get(u); console.log(`- Languages Canada search “${q}”: ${r.status}`, r.status === 200 ? "listing links: " + [...new Set([...r.body.matchAll(/href="(\/en\/listing-directory\/students\/[^"]+)"/gi)].map((m) => m[1].replace("/en/listing-directory/students/", "")))].slice(0, 12).join(", ") : short(r.body, 80)); }
})();
