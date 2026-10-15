import type { DataPoint } from "./types";
/*
 * Which kind of housing a data point describes (Ver.1.2.5, student housing first). The housing card leads with what a student pays
 * per person – university halls, homestay, a room in a shared house – and keeps the city-wide rental-market statistics behind a details
 * link. A figure of one kind is never shown as another: a whole-flat or whole-market rent is "market", never a share-house price.
 */
export type HousingKind = "dorm" | "homestay" | "share" | "market" | "other";
export const STUDENT_KINDS = ["dorm", "homestay", "share"] as const;
export type StudentKind = (typeof STUDENT_KINDS)[number];

export function housingKindOf(p: Pick<DataPoint, "metric" | "audience" | "housing">): HousingKind {
  if (p.housing) return "dorm";                                                       // run by a school, tied to a contract
  if (p.metric.startsWith("housing.homestay")) return "homestay";
  if (p.metric.startsWith("housing.privateShare") || p.metric.startsWith("housing.sharedRoom")) return "share"; // a room (one person's share), never a split whole-flat rent
  if (p.audience === "renter") return "market";                                      // statistics of the whole rental market
  return "other";
}
export const isStudentHousing = (p: Pick<DataPoint, "metric" | "audience" | "housing">) => (STUDENT_KINDS as readonly string[]).includes(housingKindOf(p));
