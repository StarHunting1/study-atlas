"use client";
import { usePersistentState } from "./persist";
import { PROFILE_KEY, cleanProfile, emptyProfile } from "./profile";
/** The saved profile (browser only). */
export const useProfile = () => usePersistentState(PROFILE_KEY, emptyProfile(), cleanProfile);
