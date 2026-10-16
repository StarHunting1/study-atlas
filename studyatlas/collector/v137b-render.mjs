// TEMPORARY (Ver.1.3.7b): renders the home page in headless Chromium on the CI runner (which can reach tiles.openfreemap.org) and prints what the map really drew:
// layer colours, label fields, country-zoom results, and the screenshots (JPEG, base64 in the log). Nothing is stored. Removed after the results are recorded.
import { chromium } from "playwright";
const BASE = "http://localhost:3066", out = {}; const imgs = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (page, name, sel = '[data-testid="interactive-map"]') => { const el = await page.locator(sel).first(); const b = await el.screenshot({ type: "jpeg", quality: 55 }); imgs.push([name, b.toString("base64")]); };
const OUTLINE = { CAN: [-141, 41.7, -52.6, 83.1], GBR: [-8.6, 49.9, 1.8, 60.8], AUS: [113.3, -43.6, 153.6, -10.7] };
(async () => {
  // glyph availability for Japanese labels
  const probe = {}; try { const st = await (await fetch("https://tiles.openfreemap.org/styles/liberty")).json(); const fonts = new Set(); st.layers.forEach((l) => (l.layout?.["text-font"] ?? []).forEach?.((f) => fonts.add(JSON.stringify(f)))); probe.fonts = [...fonts].slice(0, 6); probe.layerCount = st.layers.length; probe.glyphs = st.glyphs;
    const font = encodeURIComponent((st.layers.find((l) => l.layout?.["text-font"])?.layout["text-font"] ?? ["Noto Sans Regular"])[0]);
    for (const range of ["0-255", "12288-12543", "19968-20223"]) { const r = await fetch(st.glyphs.replace("{fontstack}", font).replace("{range}", range)); probe["glyph " + range] = `${r.status} ${(await r.arrayBuffer()).byteLength}B`; } } catch (e) { probe.error = String(e); }
  out.probe = probe;
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const open = async (vp, lang, touch) => { const ctx = await browser.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); await ctx.addInitScript((l) => localStorage.setItem("lang", l), lang); const page = await ctx.newPage(); const errs = []; page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 160)); });
    await page.goto(BASE + "/"); await page.waitForSelector('[data-testid="interactive-map"][data-map-state="idle"]', { timeout: 40000 }).catch(() => {}); await sleep(800); return { ctx, page, errs }; };
  const VPS = { phone: [{ width: 390, height: 844 }, true], ipad: [{ width: 820, height: 1180 }, true], pc: [{ width: 1280, height: 900 }, false] };
  for (const [name, [vp, touch]] of Object.entries(VPS)) {
    const { ctx, page, errs } = await open(vp, "ja", touch); const r = (out[name] = {});
    r.state = await page.locator('[data-testid="interactive-map"]').getAttribute("data-map-state"); r.overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    r.attribution = (await page.locator(".maplibregl-ctrl-attrib").innerText().catch(() => "")).replace(/\s+/g, " ");
    r.colors = await page.evaluate(() => { const m = window.__saMap; if (!m) return "no debug map"; const o = {}; for (const l of m.getStyle().layers) { const sl = l["source-layer"]; if (["water", "landcover", "park", "boundary", "waterway"].includes(sl) || l.type === "background") (o[sl ?? "background"] ??= []).push(`${l.id}:${l.type}:${JSON.stringify(m.getPaintProperty(l.id, l.type === "background" ? "background-color" : l.type === "fill" ? "fill-color" : "line-color")).slice(0, 60)}`); } o.labels = m.getStyle().layers.filter((l) => l.type === "symbol" && l["source-layer"] === "place").slice(0, 4).map((l) => `${l.id}:${JSON.stringify(m.getLayoutProperty(l.id, "text-field")).slice(0, 120)}`); o.rendered = m.queryRenderedFeatures().length; return o; });
    if (name === "pc") { r.countries = {}; }
    await shot(page, `${name}-world-ja`);
    if (name === "pc" || name === "phone") {
      for (const [code, ja] of [["GBR", "イギリス"], ["CAN", "カナダ"], ["AUS", "オーストラリア"]]) {
        await page.getByRole("button", { name: ja, exact: true }).click(); await sleep(2600);
        const st = await page.evaluate(() => { const m = window.__saMap, b = m.getBounds(), el = document.querySelector('[data-testid="interactive-map"]'); return { zoom: +m.getZoom().toFixed(2), bounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((x) => +x.toFixed(1)), pins: [...document.querySelectorAll(".sa-pin[data-active=true]:not([hidden])")].length, listItems: document.querySelectorAll('[data-testid="city-list"] li').length, heading: document.querySelector('[data-testid="country-heading"] h2')?.textContent, selFilter: JSON.stringify(m.getFilter("sa-country-sel-fill")) }; });
        const o = OUTLINE[code], b = st.bounds; st.outlineVisible = b[0] <= o[0] + 1 && b[1] <= o[1] + 1 && b[2] >= o[2] - 1 && b[3] >= o[3] - 1; (r.countries ??= {})[code] = st; await shot(page, `${name}-${code}-ja`); }
      // city: pick the first list item, expect zoom >= 8 and a card
      await page.getByRole("button", { name: "イギリス", exact: true }).click(); await sleep(2000); await page.locator('[data-testid="city-list"] li button').first().click(); await sleep(2600);
      r.city = await page.evaluate(() => ({ zoom: +window.__saMap.getZoom().toFixed(2), card: document.querySelector('[data-testid="city-card"] h2')?.textContent, selectedPins: document.querySelectorAll('.sa-pin[data-selected=true]').length })); await shot(page, `${name}-city-ja`, "#discover");
      await page.locator('[data-testid="city-card"] button[aria-label]').click(); await sleep(2200); r.afterClose = await page.evaluate(() => ({ zoom: +window.__saMap.getZoom().toFixed(2), card: !!document.querySelector('[data-testid="city-card"]') }));
      await page.getByTestId("back-countries").click(); await sleep(2200); r.back = await page.evaluate(() => ({ zoom: +window.__saMap.getZoom().toFixed(2), heading: !!document.querySelector('[data-testid="country-heading"]'), items: document.querySelectorAll('[data-testid="city-list"] li').length }));
    }
    r.errs = errs.slice(0, 5); await ctx.close();
  }
  // English
  { const { ctx, page } = await open(VPS.pc[0], "en", false); const r = (out.pc_en = {});
    r.pills = await page.evaluate(() => [...document.querySelectorAll("#discover button[aria-pressed]")].map((b) => b.textContent).slice(0, 6)); r.pinLabels = await page.evaluate(() => [...document.querySelectorAll(".sa-pin-label")].map((b) => b.textContent));
    r.labelField = await page.evaluate(() => { const m = window.__saMap; const l = m.getStyle().layers.find((x) => x.type === "symbol" && x["source-layer"] === "place"); return l && JSON.stringify(m.getLayoutProperty(l.id, "text-field")).slice(0, 140); });
    await page.getByRole("button", { name: "United Kingdom", exact: true }).click(); await sleep(2600); r.gbrHeading = await page.locator('[data-testid="country-heading"] h2').innerText(); await shot(page, "pc-GBR-en");
    // switch language on the page: labels follow
    await page.getByRole("button", { name: "日本語" }).click(); await sleep(1500); r.afterSwitch = await page.evaluate(() => ({ pills: [...document.querySelectorAll("#discover button[aria-pressed]")].map((b) => b.textContent).slice(0, 5), field: (() => { const m = window.__saMap; const l = m.getStyle().layers.find((x) => x.type === "symbol" && x["source-layer"] === "place"); return l && JSON.stringify(m.getLayoutProperty(l.id, "text-field")).slice(0, 80); })() }));
    await ctx.close(); }
  // fallback: block the tile host
  { const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await page.route("https://tiles.openfreemap.org/**", (r) => r.abort()); await page.goto(BASE + "/"); await page.waitForSelector('[data-testid="world-map"]', { timeout: 30000 }).catch(() => {}); const r = (out.fallback = {});
    r.svg = await page.locator('[data-testid="world-map"]').count(); await page.getByRole("button", { name: "カナダ", exact: true }).click(); await sleep(800); r.canada = await page.evaluate(() => document.querySelector('[data-testid="world-map"]').getAttribute("viewBox")); await page.locator('[data-testid="city-list"] li button').first().click(); await sleep(500); r.card = await page.locator('[data-testid="city-card"] h2').innerText().catch(() => ""); await shot(page, "fallback-CAN-ja", '[data-testid="world-map"]'); await ctx.close(); }
  await browser.close();
  console.log("RENDER_JSON_BEGIN"); console.log(JSON.stringify(out)); console.log("RENDER_JSON_END");
  for (const [name, b64] of imgs) { const n = Math.ceil(b64.length / 3000); console.log(`IMG_BEGIN ${name} ${b64.length}`); for (let i = 0; i < n; i++) console.log(`IMG ${name} ${b64.slice(i * 3000, (i + 1) * 3000)}`); console.log(`IMG_END ${name}`); }
})();
