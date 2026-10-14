"use client";
import { useEffect, useRef, useState } from "react";
/**
 * State saved in this browser only (localStorage). Nothing here is sent to a server.
 * `clean` validates whatever is stored (old versions, hand edits) and returns undefined to fall back to the default.
 */
export function usePersistentState<T>(key: string, initial: T, clean: (v: unknown) => T | undefined = (v) => v as T, shouldSave: (v: T) => boolean = () => true) {
  const [value, setValue] = useState<T>(initial); const [loaded, setLoaded] = useState(false); const removed = useRef(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) { const v = clean(JSON.parse(raw)); if (v !== undefined) setValue(v); } } catch {}
    setLoaded(true);
    const onStorage = (e: StorageEvent) => { if (e.key !== key) return; removed.current = e.newValue === null; try { setValue(e.newValue ? clean(JSON.parse(e.newValue)) ?? initial : initial); } catch {} };
    window.addEventListener("storage", onStorage); return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // `shouldSave` false (e.g. nothing left to keep): the stored entry is removed instead of writing an empty shell
  useEffect(() => { if (removed.current) return; if (loaded) try { if (shouldSave(value)) localStorage.setItem(key, JSON.stringify(value)); else localStorage.removeItem(key); } catch {} // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, loaded]);
  // Delete: remove the stored entry and show the default without writing it back, until the next real change
  const remove = () => { try { localStorage.removeItem(key); } catch {} removed.current = true; setValue(initial); };
  const set: typeof setValue = (v) => { removed.current = false; setValue(v); };
  return [value, set, { loaded, remove }] as const;
}
