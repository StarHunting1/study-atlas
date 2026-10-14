/* `npm run rights` writes data/official/RIGHTS.md (developer overview of every source's reuse status). */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { rightsMarkdown } from "../data/official/rightsReport";
const out = path.resolve(__dirname, "../data/official/RIGHTS.md");
writeFileSync(out, rightsMarkdown()); console.log(`wrote ${out}`);
