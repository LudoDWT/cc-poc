import type { BadgeTone } from '../components/ui';
import type { Maturite, Replicabilite, StatutJalon } from '../types/poc';

export const LABEL_MATURITE: Record<Maturite, string> = {
  idee: 'Idée',
  teste: 'Testé',
  adopte: 'Adopté',
  industrialise: 'Industrialisé',
};

// Ton du badge selon la progression de maturité (gris → ambre → bleu → vert).
export const TONE_MATURITE: Record<Maturite, BadgeTone> = {
  idee: 'neutral',
  teste: 'warning',
  adopte: 'primary',
  industrialise: 'success',
};

export const LABEL_REPLICABILITE: Record<Replicabilite, string> = {
  'one-shot': 'Ponctuel',
  recurrent: 'Récurrent',
  industrialisable: 'Industrialisable',
};

// Ton du badge selon la réplicabilité (ponctuel → récurrent → industrialisable).
export const TONE_REPLICABILITE: Record<Replicabilite, BadgeTone> = {
  'one-shot': 'neutral',
  recurrent: 'primary',
  industrialisable: 'success',
};

export const LABEL_STATUT: Record<StatutJalon, string> = {
  fait: 'Fait',
  'en-cours': 'En cours',
  'a-venir': 'À venir',
};

// Couleur d'accent décorative par métier (valeurs vives, lisibles sur les deux thèmes).
export const COULEUR_METIER: Record<string, string> = {
  po: '#7c5cff',
  pm: '#2f80ed',
  qa: '#e8862f',
  dev: '#1f44e6',
  ops: '#0e9f6e',
  uiux: '#e5484d',
  securite: '#caa015',
  data: '#0ea5a5',
};

export function couleurMetier(slug: string): string {
  return COULEUR_METIER[slug] ?? '#1f44e6';
}
