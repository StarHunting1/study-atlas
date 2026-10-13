"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
// True once the user has moved between pages inside the app, so "Back" can safely use router.back().
let navigatedInApp = false;
export const hasInAppHistory = () => navigatedInApp;
export function useTrackNavigation() {
  const p = usePathname(); const first = useRef(true);
  useEffect(() => { if (first.current) first.current = false; else navigatedInApp = true; }, [p]);
}
