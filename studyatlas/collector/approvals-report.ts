/* `npm run approvals` writes data/APPROVAL_SHEET.md (the per-claim approval sheet and the Vancouver climate sheet). */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { approvalSheet } from "../data/approvalSheet";
const out = path.resolve(__dirname, "../data/APPROVAL_SHEET.md");
writeFileSync(out, approvalSheet()); console.log(`wrote ${out}`);
