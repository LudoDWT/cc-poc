// Helpers de formatage (français)

export function nf(n: number, decimales = 0): string {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

export function formatDateFr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateCourteFr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function joursRestants(iso: string): number {
  const cible = new Date(iso).getTime();
  const maintenant = Date.now();
  return Math.ceil((cible - maintenant) / (1000 * 60 * 60 * 24));
}

const LIBELLES_TENDANCE: Record<string, string> = {
  hausse: '▲',
  baisse: '▼',
  stable: '▬',
};

export function symboleTendance(t?: string): string {
  return t ? (LIBELLES_TENDANCE[t] ?? '') : '';
}
