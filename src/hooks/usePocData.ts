import { useEffect, useState } from 'react';
import type { PocData } from '../types/poc';

// Chargement unique (mémoïsé) du fichier de données.
let cache: PocData | null = null;
let inflight: Promise<PocData> | null = null;

function load(): Promise<PocData> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    const url = `${import.meta.env.BASE_URL}data/poc.json`;
    inflight = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Impossible de charger les données (HTTP ${r.status}).`);
        return r.json();
      })
      .then((d: PocData) => {
        cache = d;
        return d;
      });
  }
  return inflight;
}

export interface UsePocData {
  data: PocData | null;
  error: string | null;
  loading: boolean;
}

export function usePocData(): UsePocData {
  const [data, setData] = useState<PocData | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    load()
      .then((d) => active && setData(d))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
