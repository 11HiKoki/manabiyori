import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "restored" | "saving" | "saved" | "error";

type UseAutoSavedDraftOptions<TDraft> = {
  delayMs?: number;
  draft: TDraft;
  enabled?: boolean;
  key: string;
  onRestore: (draft: Partial<TDraft>) => void;
};

export function useAutoSavedDraft<TDraft>({
  delayMs = 700,
  draft,
  enabled = true,
  key,
  onRestore
}: UseAutoSavedDraftOptions<TDraft>) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const loadedRef = useRef(false);
  const mountedRef = useRef(true);
  const onRestoreRef = useRef(onRestore);
  const serializedDraft = JSON.stringify(draft);

  const setStatusIfMounted = useCallback((nextStatus: AutoSaveStatus) => {
    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onRestoreRef.current = onRestore;
  }, [onRestore]);

  useEffect(() => {
    let active = true;
    loadedRef.current = false;
    setStatusIfMounted("idle");

    AsyncStorage.getItem(key)
      .then((value) => {
        if (!active) {
          return;
        }

        if (value) {
          onRestoreRef.current(JSON.parse(value) as Partial<TDraft>);
          setStatusIfMounted("restored");
        }

        loadedRef.current = true;
      })
      .catch(() => {
        loadedRef.current = true;
        setStatusIfMounted("error");
      });

    return () => {
      active = false;
    };
  }, [key, setStatusIfMounted]);

  useEffect(() => {
    if (!enabled || !loadedRef.current) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setStatusIfMounted("saving");
      AsyncStorage.setItem(key, serializedDraft)
        .then(() => setStatusIfMounted("saved"))
        .catch(() => setStatusIfMounted("error"));
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delayMs, enabled, key, serializedDraft, setStatusIfMounted]);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStatusIfMounted("idle");
    } catch {
      setStatusIfMounted("error");
    }
  }, [key, setStatusIfMounted]);

  return { clearDraft, status };
}
