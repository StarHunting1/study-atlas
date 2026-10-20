import type { Localized } from "@/lib/i18n";
import type { UniPageKind } from "./types";
/*
 * Ver.1.7.2 (research import): the OFFICIAL LINKS the 2026-10-20 research dossier named for the four front-runner universities. Links only: no figure, date or requirement lives in this file, so it is safe to ship to the browser.
 * A link is a pointer for the student, not a checked source and not an access permission: the collector never requests these hosts (collector/guard.ts), and a person has not yet opened them for StarHunting.
 * The research values themselves are internal (universityCandidates.ts) and are not imported by any screen.
 */
export const RESEARCH_DATE = "2026-10-20";
export const RESEARCHED_BY = "ChatGPT research dossier (a candidate list; NOT an approval, a rights clearance or a collection permission)";
export type PageLink = { url: string; publisher: string };
export const OFFICIAL_PAGE_LINKS: Record<string, Partial<Record<UniPageKind, PageLink>>> = {
  uom: { programSearch: { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/all-content/", publisher: "The University of Manchester" }, tuition: { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/course-details/", publisher: "The University of Manchester" } },
  ucl: { programSearch: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc?option=UBSENG00071A", publisher: "UCL" }, english: { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/english-language-requirements", publisher: "UCL" } },
  uoft: { deadlines: { url: "https://rotmancommerce.utoronto.ca/future-students/important-dates/", publisher: "Rotman Commerce, University of Toronto" }, english: { url: "https://future.utoronto.ca/english-language-requirements", publisher: "University of Toronto" }, tuition: { url: "https://rotmancommerce.utoronto.ca/current-students/international-student-welcome-guide/tuition-fees-scholarships-for-international-students/", publisher: "Rotman Commerce, University of Toronto" } },
  unimelb: { programSearch: { url: "https://study.unimelb.edu.au/find/courses/undergraduate/bachelor-of-commerce/", publisher: "The University of Melbourne" }, english: { url: "https://study.unimelb.edu.au/how-to-apply/english-language-requirements/undergraduate-english-language-requirements", publisher: "The University of Melbourne" }, deadlines: { url: "https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications/applications", publisher: "The University of Melbourne" }, tuition: { url: "https://study.unimelb.edu.au/how-to-apply/undergraduate-study/international-applications/fees-and-payments", publisher: "The University of Melbourne" } },
};
/** Programmes under research: a name and the programme's official page. Nothing about the programme's content. */
export const PROGRAMS_UNDER_RESEARCH: Record<string, { id: string; name: Localized; url: string }[]> = {
  uom: [{ id: "bsc-management", name: { en: "BSc Management (2027 entry)", ja: "BSc Management（2027年入学）" }, url: OFFICIAL_PAGE_LINKS.uom.programSearch!.url }],
  ucl: [{ id: "management-science-bsc", name: { en: "Management Science BSc (2027 entry)", ja: "Management Science BSc（2027年入学）" }, url: OFFICIAL_PAGE_LINKS.ucl.programSearch!.url }],
  uoft: [{ id: "rotman-commerce", name: { en: "Rotman Commerce (Fall 2027)", ja: "Rotman Commerce（2027年秋）" }, url: "https://rotmancommerce.utoronto.ca/future-students/important-dates/" }],
  unimelb: [{ id: "bachelor-of-commerce", name: { en: "Bachelor of Commerce", ja: "Bachelor of Commerce（商学士）" }, url: OFFICIAL_PAGE_LINKS.unimelb.programSearch!.url }],
};
