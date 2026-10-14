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
    head = []
    hits = []
    for i, row in enumerate(ws.iter_rows(values_only=True), start=1):
        if i <= 12:
            head.append((i, [c for c in row[:8]]))
        if row and any(isinstance(c, str) and (c.strip() == "E08000003" or c.strip().lower() == "manchester") for c in row[:6]):
            hits.append((i, row))
    for i, r in head:
        show(f"  row {i}:", [str(c)[:70] if c is not None else None for c in r])
    show(f"  rows mentioning E08000003/Manchester in the first 6 columns: {len(hits)}")
    for i, r in hits[:40]:
        show(f"   row {i}:", [str(c)[:40] if c is not None else None for c in r[:12]], "...", [str(c)[:40] if c is not None else None for c in r[-4:]])
    if hits:
        # the header row that names the columns (the last head row with >3 non-empty cells)
        hdr_rows = [(i, r) for i, r in head if sum(c is not None for c in r) >= 3]
        show("  candidate header rows (first 8 columns):", hdr_rows[-2:])
