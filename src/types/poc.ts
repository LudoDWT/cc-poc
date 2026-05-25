// Contrat de données du dashboard. Reflète la structure de public/data/poc.json.
// Toute la donnée du site vit dans ce fichier JSON unique, éditable à la main.

export type Tendance = 'hausse' | 'baisse' | 'stable';
export type Maturite = 'idee' | 'teste' | 'adopte' | 'industrialise';
export type Replicabilite = 'one-shot' | 'recurrent' | 'industrialisable';
export type StatutJalon = 'fait' | 'en-cours' | 'a-venir';
export type Meteo = 'vert' | 'orange' | 'rouge';

export interface PointHistorique {
  date: string; // ISO (AAAA-MM-JJ)
  valeur: number;
}

export interface Kpi {
  id: string;
  label: string;
  valeur: number;
  unite: string; // ex. "h", "%", "" (sans unité)
  decimales?: number;
  cible?: number;
  tendance?: Tendance;
  variation?: number; // évolution en % vs période précédente
  aide?: string; // infobulle / précision méthodo
  historique?: PointHistorique[];
}

export interface Verbatim {
  auteur: string;
  metier?: string;
  citation: string;
}

export interface Metier {
  slug: string;
  nom: string;
  effectif: number;
  responsable?: string; // référent du métier (affiché avec une couronne)
  pitch?: string;
  kpis: Kpi[];
  casUsageIds: string[];
  avantApresIds: string[];
  verbatims: Verbatim[];
}

export interface CasUsage {
  id: string;
  titre: string;
  metier: string; // slug du métier
  auteur: string;
  date: string;
  probleme: string;
  methode: string;
  outil: 'Claude' | 'Claude Code' | string;
  prompt?: string;
  resultat: string;
  tempsGagne: string;
  replicabilite: Replicabilite;
  maturite: Maturite;
  tags: string[];
  votes: number;
}

export interface AvantApresEtat {
  temps: string;
  effort: number; // 1 à 5
  qualite: number; // 1 à 5
  desc: string;
}

export interface AvantApres {
  id: string;
  titre: string;
  metier: string; // slug
  tache: string;
  avant: AvantApresEtat;
  apres: AvantApresEtat;
  gain: string; // ex. "-78 % de temps"
  gainPct?: number; // pour agrégation/tri
}

export interface ChiffreRex {
  label: string;
  valeur: string;
}

export interface Rex {
  id: string;
  titre: string;
  date: string;
  periode: string;
  statut: StatutJalon;
  synthese: string;
  chiffres: ChiffreRex[];
  aMarche: string[];
  freins: string[];
  recommandation: string;
  lienLivrable?: string;
}

export interface Jalon {
  date: string;
  label: string;
  type: 'config' | 'demarrage' | 'rex' | 'jalon' | 'bilan' | string;
  statut: StatutJalon;
  responsable?: string;
  desc?: string;
}

export interface MetaPoc {
  nom: string;
  sousTitre: string;
  dateConfig: string;
  dateM0: string;
  dateRex1: string;
  dateRex2: string;
  dateRex3: string;
  dateBilan: string;
  statut: string;
  meteo: Meteo;
  meteoCommentaire?: string;
  objectifs?: string[]; // objectifs qualitatifs du POC (affichés avant le lancement)
  prochaineEcheance: { label: string; date: string };
}

export interface QuestionQuestionnaire {
  q: string;
  type: string; // ex. "Ouverte", "Nombre", "Échelle 0–10"
  kpi?: string; // KPI alimenté (questionnaire mensuel)
  aide?: string;
}

export interface Questionnaires {
  amont: QuestionQuestionnaire[]; // posé une fois, avant le démarrage
  mensuel: QuestionQuestionnaire[]; // posé chaque mois pendant le POC
}

export interface PocData {
  _exemple?: boolean;
  _note?: string;
  meta: MetaPoc;
  kpisGlobaux: Kpi[];
  metiers: Metier[];
  casUsage: CasUsage[];
  avantApres: AvantApres[];
  rex: Rex[];
  timeline: Jalon[];
  questionnaires?: Questionnaires;
}
