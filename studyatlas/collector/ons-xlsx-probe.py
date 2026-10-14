"""Ver.1.2.2 temporary probe: open the official PIPR xlsx and report where Manchester (E08000003) is. Prints only; stores nothing."""
import json, sys, urllib.request, tempfile, os, re, time
from openpyxl import load_workbook

UA = "StudyAtlasCollector/1.0 (+https://github.com/StarHunting1/study-atlas)"
BASE = "https://www.ons.gov.uk"

def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
        return (data, dict(r.headers)) if binary else (data.decode("utf-8", "replace"), dict(r.headers))

def show(*a):
    print(*a, flush=True)

d, _ = get(BASE + "/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics/data")
latest = json.loads(d)["datasets"][0]["uri"]
meta, _ = get(BASE + latest + "/data")
m = json.loads(meta)
fname = m["downloads"][0]["file"]
show("# ONS PIPR xlsx probe (nothing stored)")
show("- edition:", latest, "| file:", fname, "| description:", json.dumps(m.get("description")))
url = BASE + "/file?uri=" + latest + "/" + fname
time.sleep(1)
body, hdr = get(url, binary=True)
show("- downloaded", len(body), "bytes from", url)
show("- response headers:", {k: v for k, v in hdr.items() if re.search(r"rate|limit|retry|cache|content-type|content-length|last-modified|etag", k, re.I)})
path = os.path.join(tempfile.mkdtemp(), "pipr.xlsx")
open(path, "wb").write(body)
wb = load_workbook(path, read_only=True, data_only=True)
show("- sheets:", wb.sheetnames)
for ws in wb.worksheets:
    show(f"\n## sheet '{ws.title}' max_row={ws.max_row} max_col={ws.max_column}")
    hits = []
    for i, row in enumerate(ws.iter_rows(values_only=True), start=1):
        if ws.title != "Table 1" and i <= 30:
            show(f"  row {i}:", [str(c) for c in row if c is not None])      # full text of cover / contents / notes
        if ws.title == "Table 1" and i <= 3:
            show(f"  row {i}: " + json.dumps([None if c is None else str(c) for c in row], ensure_ascii=False))   # title, note line, ALL 40 column headers
        if ws.title == "Table 1" and row and any(isinstance(c, str) and (c.strip() == "E08000003" or c.strip().lower() == "manchester") for c in row[:6]):
            hits.append((i, row))
    if ws.title == "Table 1":
        show(f"  Manchester rows: {len(hits)}; first {hits[0][1][0] if hits else None}; last {hits[-1][1][0] if hits else None}")
        areas = set()
        for i, r in hits[-4:]:
            show(f"   row {i}: " + json.dumps([None if c is None else str(c) for c in r], ensure_ascii=False))
