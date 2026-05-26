import { lazy } from 'react';

// Source unique des imports dynamiques des pages : sert à la fois au lazy-loading
// (App, via lazy()) et au prefetch au survol des liens de nav (Layout). Comme le
// spécificateur d'import est identique des deux côtés, Vite résout le même chunk.
const loaders = {
  overview: () => import('../pages/Overview'),
  timeline: () => import('../pages/TimelinePage'),
  kpi: () => import('../pages/KpiPage'),
  metiers: () => import('../pages/Metiers'),
  metierDetail: () => import('../pages/MetierDetail'),
  avantApres: () => import('../pages/AvantApresPage'),
  casUsage: () => import('../pages/CasUsagePage'),
  rex: () => import('../pages/RexPage'),
  rexDetail: () => import('../pages/RexDetailPage'),
  rexInterne: () => import('../pages/RexInternePage'),
};

export const Pages = {
  Overview: lazy(loaders.overview),
  TimelinePage: lazy(loaders.timeline),
  KpiPage: lazy(loaders.kpi),
  Metiers: lazy(loaders.metiers),
  MetierDetail: lazy(loaders.metierDetail),
  AvantApresPage: lazy(loaders.avantApres),
  CasUsagePage: lazy(loaders.casUsage),
  RexPage: lazy(loaders.rex),
  RexDetailPage: lazy(loaders.rexDetail),
  RexInternePage: lazy(loaders.rexInterne),
};

// Chemins de la nav -> loader du chunk correspondant.
const byPath: Record<string, () => Promise<unknown>> = {
  '/': loaders.overview,
  '/timeline': loaders.timeline,
  '/kpi': loaders.kpi,
  '/metiers': loaders.metiers,
  '/avant-apres': loaders.avantApres,
  '/cas-usage': loaders.casUsage,
  '/rex-interne': loaders.rexInterne,
  '/rex': loaders.rex,
};

type Loader = () => Promise<unknown>;

// Résout le loader d'un chemin : routes de nav (correspondance exacte) ou routes à
// paramètre (/metiers/:slug, /rex/:id) par préfixe.
function resolveLoader(path: string): Loader | undefined {
  if (byPath[path]) return byPath[path];
  if (path.startsWith('/metiers/')) return loaders.metierDetail;
  if (path.startsWith('/rex/')) return loaders.rexDetail;
  return undefined;
}

const prefetched = new Set<Loader>();

/** Précharge le chunk d'une route (survol/focus d'un lien). Idempotent par chunk. */
export function prefetchRoute(path: string): void {
  const load = resolveLoader(path);
  if (!load || prefetched.has(load)) return;
  prefetched.add(load);
  void load();
}
