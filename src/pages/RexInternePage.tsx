import { ArrowRight, CalendarClock, ClipboardList, MessageSquareQuote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataGate } from '../components/DataGate';
import { Eyebrow, PageHeader } from '../components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateCourteFr } from '../lib/format';
import type { QuestionQuestionnaire } from '../types/poc';

// Contenu de repli : utilisé si poc.json ne fournit pas de section "questionnaires".
// La source éditable est public/data/poc.json → questionnaires.{amont,mensuel}.
const AMONT_DEFAUT: QuestionQuestionnaire[] = [
  { q: "Quels outils ou usages d'IA utilisez-vous déjà aujourd'hui ?", type: 'Ouverte' },
  { q: "Quel est votre niveau d'usage actuel de l'IA ?", type: 'Échelle 0–10' },
  {
    q: "Quel est votre niveau d'aisance avec la ligne de commande / le terminal ?",
    type: 'Échelle 0–10',
    aide: 'Clé pour Claude Code, en particulier hors profils techniques.',
  },
  {
    q: "Combien d'heures par semaine y consacrez-vous aujourd'hui ?",
    type: 'Nombre (h)',
    aide: 'Sert de point de référence (baseline) pour mesurer le temps gagné.',
  },
  { q: "Quelles tâches répétitives aimeriez-vous déléguer à l'IA ?", type: 'Ouverte' },
  {
    q: 'Sur quels travaux attendez-vous le plus de valeur ?',
    type: 'Choix multiple',
    aide: 'Specs, code, tests, documentation, revue, analyse…',
  },
  {
    q: 'Quel type de données manipulez-vous (sensibilité, confidentialité) ?',
    type: 'Choix multiple',
    aide: 'Publiques, internes, confidentielles, données personnelles…',
  },
  {
    q: "Quelle est votre appétence à utiliser l'IA au quotidien ?",
    type: 'Échelle 0–10',
    aide: "À reposer en fin de POC pour mesurer l'évolution de l'enthousiasme.",
  },
  { q: "Quelles réserves ou craintes avez-vous vis-à-vis de l'outil ?", type: 'Ouverte' },
  { q: 'Un objectif personnel pour ce POC ?', type: 'Ouverte' },
  { q: 'Pour vous, à quoi ressemble un POC réussi ?', type: 'Ouverte' },
];

const MENSUEL_DEFAUT: QuestionQuestionnaire[] = [
  {
    q: 'Combien de jours cette semaine avez-vous utilisé Claude / Claude Code ?',
    type: 'Nombre',
    kpi: "Taux d'adoption",
  },
  { q: "Combien d'interactions IA par semaine, en moyenne ?", type: 'Nombre', kpi: "Fréquence d'usage" },
  {
    q: "Sur quels types de tâches l'avez-vous utilisé ?",
    type: 'Choix multiple',
    aide: 'Specs, code, tests, documentation, revue, analyse…',
  },
  {
    q: "Combien de tâches avez-vous réalisées avec l'aide de l'IA ?",
    type: 'Nombre',
    kpi: 'Tâches assistées',
  },
  {
    q: 'Quel temps estimez-vous avoir gagné ce mois-ci ?',
    type: 'Nombre (h)',
    kpi: 'Heures gagnées · Temps gagné par métier',
  },
  { q: "Quelle est la qualité perçue des résultats de l'IA ce mois-ci ?", type: 'Échelle 0–10' },
  {
    q: "À quelle fréquence avez-vous dû reprendre ou corriger le travail de l'IA ?",
    type: 'Échelle',
    aide: 'De « jamais » à « très souvent » : mesure la fiabilité perçue.',
  },
  { q: "Votre confiance dans l'outil a-t-elle évolué ce mois-ci ?", type: 'Tendance (↗ / → / ↘)' },
  { q: 'Quelle est votre satisfaction globale ce mois-ci ?', type: 'Échelle 0–10', kpi: 'Satisfaction' },
  {
    q: 'Recommanderiez-vous Claude / Claude Code à un collègue ?',
    type: 'Échelle 0–10',
    aide: 'Net Promoter Score (NPS).',
  },
  {
    q: "Avez-vous partagé un prompt ou une astuce avec l'équipe ce mois-ci ?",
    type: 'Oui / Non + précision',
  },
  { q: 'Un cas d’usage marquant à partager ?', type: 'Ouverte', kpi: "Cas d'usage déployés" },
  {
    q: "Y a-t-il eu un cas où vous auriez pu utiliser l'IA mais ne l'avez pas fait ? Pourquoi ?",
    type: 'Ouverte',
  },
  { q: 'Avez-vous rencontré un frein ? Lequel ?', type: 'Ouverte', kpi: 'Météo du POC · REX' },
  {
    q: "Aujourd'hui, recommanderiez-vous de généraliser l'outil ?",
    type: 'Choix unique',
    aide: 'Oui / Plutôt oui / Plutôt non / Non : signal Go / No-Go pour le bilan.',
  },
  { q: 'Impact sur votre charge mentale et votre plaisir au travail ?', type: 'Tendance (↗ / → / ↘)' },
];

// Date d'un REX externe moins 7 jours : la consolidation interne se fait une semaine avant.
function moins7j(iso: string): string {
  return new Date(new Date(iso).getTime() - 7 * 86_400_000).toISOString().slice(0, 10);
}

function Chip({ children, tone = 'neutre' }: { children: React.ReactNode; tone?: 'neutre' | 'kpi' }) {
  const cls =
    tone === 'kpi'
      ? 'bg-primary/10 text-primary font-medium'
      : 'bg-secondary text-secondary-foreground';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
      {children}
    </span>
  );
}

function QuestionList({ questions }: { questions: QuestionQuestionnaire[] }) {
  return (
    <ol className="divide-y divide-border">
      {questions.map((item, i) => (
        <li key={i} className="flex gap-3 py-3.5 first:pt-0 last:pb-0" data-reveal>
          <span className="mono mt-0.5 text-xs text-muted-foreground">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.q}</p>
            {item.aide && (
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{item.aide}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip>{item.type}</Chip>
              {item.kpi && <Chip tone="kpi">→ {item.kpi}</Chip>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function RexInternePage() {
  return (
    <DataGate
      render={(d) => {
        const amont = d.questionnaires?.amont ?? AMONT_DEFAUT;
        const mensuel = d.questionnaires?.mensuel ?? MENSUEL_DEFAUT;

        const etapes = [
          {
            icon: ClipboardList,
            titre: 'En amont',
            quand: `avant le ${formatDateCourteFr(d.meta.dateM0)}`,
            desc: 'On recueille les attentes et l’usage initial de chacun : ça fixe la baseline.',
          },
          {
            icon: CalendarClock,
            titre: 'Pulse mensuel',
            quand: 'chaque mois, pendant le POC',
            desc: 'Un court questionnaire auprès des 9 participants alimente les indicateurs du dashboard.',
          },
          {
            icon: MessageSquareQuote,
            titre: 'Consolidation',
            quand: `${formatDateCourteFr(moins7j(d.meta.dateRex1))} · ${formatDateCourteFr(moins7j(d.meta.dateRex2))} · ${formatDateCourteFr(moins7j(d.meta.dateRex3))}`,
            desc: 'Une semaine avant chaque REX externe : on synthétise données et verbatims pour préparer la restitution.',
          },
        ];

        return (
          <>
            <PageHeader
              eyebrow="Démarche & questionnaires"
              title="REX interne"
              intro="Comment les chiffres du dashboard sont obtenus : on interroge l’équipe en amont (attentes), puis chaque mois pour mesurer. Ci-dessous, les questions posées aux participants, à titre illustratif."
            />

            {/* Démarche en 3 temps */}
            <div className="mb-12 grid gap-3 sm:grid-cols-3">
              {etapes.map((e) => (
                <Card key={e.titre} data-reveal>
                  <CardContent>
                    <e.icon className="size-5 text-primary" />
                    <p className="mt-3 font-semibold">{e.titre}</p>
                    <p className="mono mt-1 text-xs text-muted-foreground">{e.quand}</p>
                    <p className="mt-2 text-sm leading-snug text-muted-foreground">{e.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Questionnaire d'amont */}
            <section className="mb-10">
              <Eyebrow>Questionnaire d’amont : attentes</Eyebrow>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Posé une fois, avant le démarrage, pour cadrer les objectifs et établir un point de référence.
              </p>
              <Card data-reveal>
                <CardContent>
                  <QuestionList questions={amont} />
                </CardContent>
              </Card>
            </section>

            {/* Pulse mensuel */}
            <section>
              <Eyebrow>Pulse mensuel : mesure</Eyebrow>
              <p className="mb-4 mt-1 text-sm text-muted-foreground">
                Posé chaque mois. Chaque question alimente un indicateur précis du dashboard (étiquette
                <span className="mx-1 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  → KPI
                </span>
                ).
              </p>
              <Card data-reveal>
                <CardContent>
                  <QuestionList questions={mensuel} />
                </CardContent>
              </Card>
              <Link
                to="/rex"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Voir les restitutions (REX externe) <ArrowRight className="size-4" />
              </Link>
            </section>
          </>
        );
      }}
    />
  );
}
