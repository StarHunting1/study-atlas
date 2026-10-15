"use client";
import { useEffect, useState } from "react";
import { usePersistentState } from "./persist";
import { PROFILE_KEY, cleanProfile } from "./profile";
import { STUDY_MODES, type StudyMode } from "@/data/official/studyType";
/** City-page study type (language / university), kept in this browser only under its own key. The Planner profile (PROFILE_KEY) is only read, never written. */
export const STUDY_MODE_KEY = "studyatlas.studyMode";
export const cleanMode = (v: unknown): StudyMode | undefined => ((STUDY_MODES as readonly unknown[]).includes(v) ? (v as StudyMode) : undefined);
/** Chosen mode; until one is chosen: the Planner's study type if it has one, else language study. */
export function useStudyMode() {
  const [saved, setSaved] = usePersistentState<StudyMode | "">(STUDY_MODE_KEY, "", (v) => cleanMode(v) ?? "", (v) => v !== "");
  const [fromPlanner, setFromPlanner] = useState<StudyMode | "">("");
  useEffect(() => { try { const raw = localStorage.getItem(PROFILE_KEY); const t = raw ? cleanProfile(JSON.parse(raw))?.studyType : ""; setFromPlanner(cleanMode(t) ?? ""); } catch {} }, []);
  const mode: StudyMode = saved || fromPlanner || "language";
  return { mode, chosen: saved !== "", setMode: (m: StudyMode) => setSaved(m) };
}
