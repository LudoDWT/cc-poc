import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  Coins,
  FileCheck2,
  FileDown,
  Layers,
  Scale,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { DataGate } from '../components/DataGate';
import { CasUsageCard, VerbatimCard } from '../components/cards';
import { Badge, Eyebrow, EmptyState, PageHeader, StatutPill, type BadgeTone } from '../components/ui';
import { HBar, SerieLine } from '../components/charts';
import { Counter } from '../components/Counter';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateFr, nf } from '../lib/format';
import {
  LABEL_CONFORMITE,
  LABEL_NIVEAU,
  TONE_CONFORMITE,
  TONE_NIVEAU,
  couleurMetier,
} from '../lib/labels';
import type {
  ChiffreRex,
  LigneEvaluation,
  LigneRisque,
  Niveau,
  PocData,
  Rex,
  SensDecision,
  StatutConformite,
} from '../types/poc';

const SENS_LABEL: Record<SensDecision, string> = {
  go: 'Go',
  'go-conditionnel': 'Go conditionnel',
  'no-go': 'No-Go',
};
const SENS_TONE: Record<SensDecision, BadgeTone> = {
  go: 'success',
  'go-conditionnel': 'warning',
  'no-go': 'destructive',
};

// Extrait la partie numérique d'un chiffre ("47 %", "7,7 / 10") pour l'animer au compteur.
function splitChiffre(v: string): { prefix: string; num: number; dec: number; suffix: string } | null {
  const m = v.match(/-?\d+(?:[.,]\d+)?/);
  if (!m || m.index === undefined) return null;
  const raw = m[0];
  const decPart = raw.split(/[.,]/)[1];
  return {
    prefix: v.slice(0, m.index),
    num: parseFloat(raw.replace(',', '.')),
    dec: decPart ? decPart.length : 0,
    suffix: v.slice(m.index + raw.length),
  };
}

// Extrait le montant numérique d'un libellé monétaire ("≈ 4 500 €" -> 4500) ; null si non chiffré.
function montantNum(v: string): number | null {
  const m = v.replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(',', '.')) : null;
}

function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  id: string;
  icon?: typeof ShieldCheck;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-center gap-2" data-reveal>
        {Icon && <Icon className="size-4 text-primary" />}
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="-mt-3 mb-5 text-xl font-semibold tracking-tight" data-reveal>
        {title}
      </h2>
      {children}
    </section>
  );
}

function PerimetreItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="eyebrow">{label}</p>
        <div className="mt-0.5 text-sm font-semibold">{children}</div>
      </div>
    </div>
  );
}

function ChiffreCard({ c }: { c: ChiffreRex }) {
  const parsed = splitChiffre(c.valeur);
  const cibleParsed = c.cible ? splitChiffre(c.cible) : null;
  const pct =
    parsed && cibleParsed && cibleParsed.num > 0
      ? Math.min(100, Math.round((parsed.num / cibleParsed.num) * 100))
      : null;
  return (
    <Card data-reveal className="gap-0">
      <CardContent>
        {parsed ? (
          <Counter
            value={parsed.num}
            decimals={parsed.dec}
            prefix={parsed.prefix}
            suffix={parsed.suffix}
            className="mono text-3xl font-semibold tracking-tight"
          />
        ) : (
          <p className="mono text-3xl font-semibold tracking-tight">{c.valeur}</p>
        )}
        <p className="mt-1 text-xs leading-tight text-muted-foreground">{c.label}</p>
        {c.cible && pct !== null && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-[0.7rem] leading-tight text-muted-foreground">
              {pct} % de l'objectif&nbsp;· cible {c.cible}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ORDRE_STATUT: StatutConformite[] = ['conforme', 'en-cours', 'a-traiter'];
const PLURIEL_CONFORMITE: Record<StatutConformite, string> = {
  conforme: 'conformes',
  'en-cours': 'en cours',
  'a-traiter': 'à traiter',
};

function EvalList({ items }: { items: LigneEvaluation[] }) {
  const counts = items.reduce<Record<StatutConformite, number>>(
    (acc, it) => {
      if (it.statut) acc[it.statut] += 1;
      return acc;
    },
    { conforme: 0, 'en-cours': 0, 'a-traiter': 0 },
  );
  const hasStatuts = ORDRE_STATUT.some((s) => counts[s] > 0);
  return (
    <Card data-reveal>
      <CardContent>
        {hasStatuts && (
          <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
            {ORDRE_STATUT.filter((s) => counts[s] > 0).map((s) => (
              <Badge key={s} tone={TONE_CONFORMITE[s]}>
                {counts[s]}{' '}
                {counts[s] > 1 ? PLURIEL_CONFORMITE[s] : LABEL_CONFORMITE[s].toLowerCase()}
              </Badge>
            ))}
          </div>
        )}
        <ul className="divide-y divide-border">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <div className="sm:flex-1">
                <p className="text-sm font-medium">{it.titre}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{it.detail}</p>
              </div>
              {it.statut && (
                <span className="shrink-0">
                  <Badge tone={TONE_CONFORMITE[it.statut]}>{LABEL_CONFORMITE[it.statut]}</Badge>
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// --- Matrice des risques (impact x probabilité) ---
const NIVEAUX: Niveau[] = ['faible', 'moyen', 'eleve'];
type RisqueTone = 'success' | 'warning' | 'destructive';

// Criticité d'une cellule = somme des index impact + probabilité (0 à 4).
function criticite(somme: number): RisqueTone {
  if (somme <= 1) return 'success';
  if (somme === 2) return 'warning';
  return 'destructive';
}
const CELL_BG: Record<RisqueTone, string> = {
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/20 bg-warning/5',
  destructive: 'border-destructive/20 bg-destructive/5',
};
const PASTILLE: Record<RisqueTone, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
};

function MatriceRisques({ risques }: { risques: LigneRisque[] }) {
  const niv = (n: Niveau) => NIVEAUX.indexOf(n);
  const lignes = [...NIVEAUX].reverse(); // impact élevé en haut, faible en bas
  return (
    <Card data-reveal>
      <CardContent>
        <div className="flex gap-2">
          <span className="eyebrow flex items-center rotate-180 text-muted-foreground [writing-mode:vertical-rl]">
            Impact
          </span>
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[3.5rem_repeat(3,minmax(0,1fr))] gap-1.5">
              {lignes.map((impact) => (
                <Fragment key={impact}>
                  <div className="flex items-center justify-end pr-1 text-right text-xs text-muted-foreground">
                    {LABEL_NIVEAU[impact]}
                  </div>
                  {NIVEAUX.map((proba) => {
                    const tone = criticite(niv(impact) + niv(proba));
                    const items = risques
                      .map((r, i) => ({ r, n: i + 1 }))
                      .filter((x) => x.r.impact === impact && x.r.probabilite === proba);
                    return (
                      <div
                        key={proba}
                        className={`flex min-h-[3.25rem] flex-wrap content-center items-center justify-center gap-1 rounded-lg border ${CELL_BG[tone]}`}
                      >
                        {items.map((x) => (
                          <span
                            key={x.n}
                            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${PASTILLE[tone]}`}
                          >
                            {x.n}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
              <div />
              {NIVEAUX.map((proba) => (
                <div key={proba} className="pt-1 text-center text-xs text-muted-foreground">
                  {LABEL_NIVEAU[proba]}
                </div>
              ))}
            </div>
            <p className="eyebrow mt-2 text-center text-muted-foreground">Probabilité</p>
          </div>
        </div>
        <ol className="mt-5 grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
          {risques.map((r, i) => {
            const tone = criticite(niv(r.impact) + niv(r.probabilite));
            return (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-semibold ${PASTILLE[tone]}`}
                >
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{r.risque}</span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

const SOMMAIRE: { id: string; label: string }[] = [
  { id: 'contexte', label: 'Contexte' },
  { id: 'chiffres', label: 'Chiffres clés' },
  { id: 'roi', label: 'ROI' },
  { id: 'trajectoire', label: 'Trajectoire' },
  { id: 'metiers', label: 'Par métier' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'gouvernance', label: 'Gouvernance' },
  { id: 'conformite', label: 'Conformité' },
  { id: 'risques', label: 'Risques' },
  { id: 'bilan', label: 'Bilan' },
  { id: 'cas', label: "Cas d'usage" },
  { id: 'verbatims', label: 'Verbatims' },
  { id: 'decision', label: 'Décision' },
];

// Surligne dans le sommaire la section actuellement visible (scroll-spy).
function useActiveSection(): string {
  const [active, setActive] = useState<string>(SOMMAIRE[0].id);
  useEffect(() => {
    const els = SOMMAIRE.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -75% 0px' },
    );
    els.forEach((el) => observer.observe(el));

    // Tout en bas de page, la dernière section peut ne jamais entrer dans la bande de
    // détection : on force alors le dernier item du sommaire comme actif.
    const lastId = els[els.length - 1]?.id;
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && lastId) setActive(lastId);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return active;
}

function Sommaire({ active }: { active: string }) {
  return (
    <nav aria-label="Sommaire du dossier">
      <p className="eyebrow mb-3 pl-4">Sommaire</p>
      <ul className="border-l">
        {SOMMAIRE.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                active === s.id
                  ? 'border-primary font-medium text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RexDetail({ d, rex }: { d: PocData; rex: Rex }) {
  const dossier = rex.dossier;
  const pilote = d.timeline.find((j) => j.type === 'rex' && j.label.includes(rex.titre))?.responsable;
  const metierNom = (slug: string) => d.metiers.find((m) => m.slug === slug)?.nom ?? slug;

  const adoption = d.kpisGlobaux.find((k) => k.id === 'taux-adoption');
  const heures = d.kpisGlobaux.find((k) => k.id === 'heures-gagnees');

  // Jalon de fin de période (ex. "M2") dérivé de rex.periode, et rythme des REX.
  const jalonFin = rex.periode.split('→').pop()?.trim() ?? '';
  const rythmeRex = d.rex
    .map((r) => r.periode.split('→').pop()?.trim())
    .filter(Boolean)
    .join(' · ');

  // ROI : ratio atteint vs cible globale, et totaux coûts / gains chiffrés.
  const roiCible = d.kpisGlobaux.find((k) => k.id === 'roi')?.cible;
  const ratioNum = dossier ? splitChiffre(dossier.roi.ratio)?.num ?? null : null;
  const totalCouts = dossier
    ? dossier.roi.couts.reduce((s, c) => s + (montantNum(c.valeur) ?? 0), 0)
    : 0;
  const totalGains = dossier
    ? dossier.roi.gains.reduce((s, g) => s + (montantNum(g.valeur) ?? 0), 0)
    : 0;

  // Navigation d'un REX à l'autre.
  const idxRex = d.rex.findIndex((r) => r.id === rex.id);
  const rexPrec = idxRex > 0 ? d.rex[idxRex - 1] : null;
  const rexSuiv = idxRex >= 0 && idxRex < d.rex.length - 1 ? d.rex[idxRex + 1] : null;

  const parMetier = d.metiers
    .map((m) => ({ label: m.nom, valeur: m.kpis[0]?.valeur ?? 0, color: couleurMetier(m.slug) }))
    .filter((x) => x.valeur > 0)
    .sort((a, b) => b.valeur - a.valeur);

  const gains = [...d.avantApres]
    .sort((a, b) => (b.gainPct ?? 0) - (a.gainPct ?? 0))
    .map((a) => ({ label: a.titre, valeur: a.gainPct ?? 0, color: couleurMetier(a.metier) }));

  const casDeployes = d.casUsage.filter(
    (c) => c.maturite === 'adopte' || c.maturite === 'industrialise',
  );
  const verbatims = d.metiers.flatMap((m) => m.verbatims).slice(0, 6);
  const active = useActiveSection();

  return (
    <>
      <Link
        to="/rex"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Tous les REX
      </Link>

      <PageHeader
        eyebrow="Dossier de validation"
        title={`${rex.titre} · ${rex.periode.split('→').pop()?.trim() ?? ''}`.trim() || rex.titre}
        intro={rex.synthese}
      >
        <div
          className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          data-reveal
        >
          <StatutPill statut={rex.statut} />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 opacity-70" /> {rex.periode}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 opacity-70" /> {formatDateFr(rex.date)}
          </span>
          {pilote && (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4 opacity-70" /> Pilote · {pilote}
            </span>
          )}
          {dossier && (
            <Badge tone={SENS_TONE[dossier.decision.sens]}>
              Avis : {SENS_LABEL[dossier.decision.sens]}
            </Badge>
          )}
        </div>
        {rex.lienLivrable && (
          <a
            href={rex.lienLivrable}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            data-reveal
          >
            <FileDown className="size-4 text-primary" />
            Télécharger le dossier (PDF)
          </a>
        )}
      </PageHeader>

      {/* Sommaire mobile : chips horizontales (le sommaire sticky est réservé au desktop). */}
      <nav aria-label="Sommaire du dossier" className="mb-10 flex flex-wrap gap-2 lg:hidden" data-reveal>
        {SOMMAIRE.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-start lg:gap-12">
        <div className="min-w-0 space-y-14">
        {/* Contexte & périmètre */}
        <Section id="contexte" icon={BadgeCheck} eyebrow="Cadre" title="Contexte & périmètre">
          {dossier && <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground" data-reveal>{dossier.contexte}</p>}
          {dossier && (
            <Card data-reveal>
              <CardContent className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border">
                <PerimetreItem icon={Users} label="Participants">
                  <span className="mono">{dossier.perimetre.participants}</span>
                </PerimetreItem>
                <PerimetreItem icon={Layers} label="Métiers">
                  <span className="mono">{dossier.perimetre.metiers}</span>
                </PerimetreItem>
                <PerimetreItem icon={CalendarDays} label="Période">
                  {dossier.perimetre.duree}
                </PerimetreItem>
                <PerimetreItem icon={Wrench} label="Outils">
                  <span className="font-normal text-muted-foreground">
                    {dossier.perimetre.outils.join(' · ')}
                  </span>
                </PerimetreItem>
              </CardContent>
            </Card>
          )}
        </Section>

        {/* Chiffres clés */}
        {rex.chiffres.length > 0 && (
          <Section
            id="chiffres"
            icon={TrendingUp}
            eyebrow="Mesure"
            title={jalonFin ? `Chiffres clés (à ${jalonFin})` : 'Chiffres clés'}
          >
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {rex.chiffres.map((c) => (
                <ChiffreCard key={c.label} c={c} />
              ))}
            </div>
          </Section>
        )}

        {/* ROI */}
        {dossier && (
          <Section id="roi" icon={Coins} eyebrow="Rentabilité" title="Retour sur investissement">
            <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground" data-reveal>
              {dossier.roi.synthese}
            </p>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card data-reveal>
                <CardContent>
                  <p className="eyebrow mb-3 text-destructive">Coûts engagés</p>
                  <ul className="space-y-2.5">
                    {dossier.roi.couts.map((c) => (
                      <li key={c.label} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{c.label}</span>
                        <span className="mono shrink-0 font-medium">{c.valeur}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card data-reveal>
                <CardContent>
                  <p className="eyebrow mb-3 text-success">Gains</p>
                  <ul className="space-y-2.5">
                    {dossier.roi.gains.map((g) => (
                      <li key={g.label} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{g.label}</span>
                        <span className="mono shrink-0 font-medium">{g.valeur}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card data-reveal className="bg-primary/5">
                <CardContent className="flex h-full flex-col justify-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ROI estimé</p>
                    <p className="mono text-3xl font-semibold text-primary">{dossier.roi.ratio}</p>
                    {roiCible != null && ratioNum != null && (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(100, Math.round((ratioNum / roiCible) * 100))}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Objectif {nf(roiCible)}× à M6
                        </p>
                      </div>
                    )}
                  </div>
                  {dossier.roi.payback && (
                    <div>
                      <p className="text-xs text-muted-foreground">Retour sur investissement (payback)</p>
                      <p className="mono text-lg font-semibold">{dossier.roi.payback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {(totalCouts > 0 || totalGains > 0) && (
              <Card data-reveal className="mt-4">
                <CardContent>
                  <p className="eyebrow mb-3">Coûts engagés vs gains mesurés</p>
                  <HBar
                    data={[
                      { label: 'Coûts engagés', valeur: totalCouts, color: 'var(--destructive)' },
                      { label: 'Gains mesurés', valeur: totalGains, color: 'var(--success)' },
                    ]}
                    unite=" €"
                  />
                </CardContent>
              </Card>
            )}
          </Section>
        )}

        {/* Trajectoire */}
        {(adoption?.historique || heures?.historique) && (
          <Section id="trajectoire" icon={TrendingUp} eyebrow="Évolution" title="Trajectoire depuis le démarrage">
            <div className="grid gap-4 lg:grid-cols-2">
              {adoption?.historique && (
                <ChartFrame title="Taux d'adoption" hint="% de l'équipe">
                  <SerieLine data={adoption.historique} unite="%" color="var(--chart-1)" />
                </ChartFrame>
              )}
              {heures?.historique && (
                <ChartFrame title="Heures gagnées (cumul)" hint="heures">
                  <SerieLine data={heures.historique} unite=" h" color="var(--chart-2)" />
                </ChartFrame>
              )}
            </div>
          </Section>
        )}

        {/* Par métier */}
        {parMetier.length > 0 && (
          <Section id="metiers" icon={TrendingUp} eyebrow="Détail" title="Temps gagné par métier (par semaine)">
            <Card data-reveal>
              <CardContent>
                <HBar data={parMetier} unite=" h" />
              </CardContent>
            </Card>
          </Section>
        )}

        {/* Sécurité */}
        {dossier && (
          <Section id="securite" icon={ShieldCheck} eyebrow="SSI" title="Sécurité du système d'information">
            <EvalList items={dossier.securite} />
          </Section>
        )}

        {/* Gouvernance */}
        {dossier && (
          <Section id="gouvernance" icon={Scale} eyebrow="Pilotage" title="Gouvernance">
            <EvalList items={dossier.gouvernance} />
          </Section>
        )}

        {/* Conformité */}
        {dossier && (
          <Section id="conformite" icon={FileCheck2} eyebrow="Cadre légal" title="Conformité">
            <EvalList items={dossier.conformite} />
          </Section>
        )}

        {/* Risques */}
        {dossier && (
          <Section id="risques" icon={TriangleAlert} eyebrow="Maîtrise" title="Risques & mitigations">
            <MatriceRisques risques={dossier.risques} />
            <Card data-reveal className="mt-4">
              <CardContent className="px-0 sm:px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Risque</TableHead>
                      <TableHead className="w-24">Impact</TableHead>
                      <TableHead className="w-28">Probabilité</TableHead>
                      <TableHead>Mitigation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dossier.risques.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.risque}</TableCell>
                        <TableCell>
                          <Badge tone={TONE_NIVEAU[r.impact]}>{LABEL_NIVEAU[r.impact]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge tone={TONE_NIVEAU[r.probabilite]}>{LABEL_NIVEAU[r.probabilite]}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.mitigation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* Bilan qualitatif */}
        {(rex.aMarche.length > 0 || rex.freins.length > 0) && (
          <Section id="bilan" icon={BadgeCheck} eyebrow="Qualitatif" title="Ce qui a marché · Freins">
            <div className="grid gap-4 sm:grid-cols-2">
              {rex.aMarche.length > 0 && (
                <Card data-reveal>
                  <CardContent>
                    <p className="eyebrow mb-3 text-success">Ce qui a marché</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {rex.aMarche.map((x, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-success">+</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {rex.freins.length > 0 && (
                <Card data-reveal>
                  <CardContent>
                    <p className="eyebrow mb-3 text-warning">Freins</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {rex.freins.map((x, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-warning">!</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </Section>
        )}

        {/* Cas d'usage déployés */}
        {casDeployes.length > 0 && (
          <Section id="cas" icon={BadgeCheck} eyebrow="Preuves" title="Cas d'usage déployés">
            <div className="grid gap-4 lg:grid-cols-2">
              {casDeployes.map((c) => (
                <CasUsageCard key={c.id} cas={c} metierNom={metierNom(c.metier)} />
              ))}
            </div>
            {gains.length > 0 && (
              <Card data-reveal className="mt-4">
                <CardContent>
                  <p className="eyebrow mb-3">Gains de temps mesurés (avant / après)</p>
                  <HBar data={gains} unite=" %" />
                </CardContent>
              </Card>
            )}
            <Link
              to="/cas-usage"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Explorer tout le catalogue <ArrowRight className="size-4" />
            </Link>
          </Section>
        )}

        {/* Verbatims */}
        {verbatims.length > 0 && (
          <Section id="verbatims" icon={BadgeCheck} eyebrow="Terrain" title="Verbatims de l'équipe">
            <div className="grid gap-4 md:grid-cols-3">
              {verbatims.map((v, i) => (
                <VerbatimCard key={i} verbatim={v} />
              ))}
            </div>
          </Section>
        )}

        {/* Décision */}
        <Section id="decision" icon={BadgeCheck} eyebrow="Conclusion" title="Décision & prochaines étapes">
          <Card data-reveal className="border-primary/30 bg-primary/5">
            <CardContent>
              {dossier && (
                <div className="mb-3">
                  <Badge tone={SENS_TONE[dossier.decision.sens]}>
                    {SENS_LABEL[dossier.decision.sens]}
                  </Badge>
                </div>
              )}
              <p className="text-sm leading-relaxed text-foreground">
                {dossier?.decision.recommandation ?? rex.recommandation}
              </p>
              {dossier?.decision.conditions && dossier.decision.conditions.length > 0 && (
                <>
                  <p className="eyebrow mb-2 mt-4">Conditions</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {dossier.decision.conditions.map((c, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">→</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
          <p className="mt-4 text-xs text-muted-foreground" data-reveal>
            Document vivant, mis à jour à chaque jalon (REX {rythmeRex}). Dernière consolidation&nbsp;:{' '}
            {formatDateFr(rex.date)}.
          </p>
        </Section>
        </div>

        {/* Sommaire latéral sticky (desktop) : la page est longue, il reste toujours accessible. */}
        <aside className="sticky top-24 hidden self-start lg:block">
          <Sommaire active={active} />
        </aside>
      </div>

      {(rexPrec || rexSuiv) && (
        <nav
          className="mt-12 flex items-stretch justify-between gap-4 border-t pt-6"
          aria-label="Navigation entre les REX"
        >
          {rexPrec ? (
            <Link
              to={`/rex/${rexPrec.id}`}
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              <span>
                <span className="block text-xs">REX précédent</span>
                <span className="font-medium text-foreground">{rexPrec.titre}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {rexSuiv ? (
            <Link
              to={`/rex/${rexSuiv.id}`}
              className="group inline-flex items-center gap-2 text-right text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>
                <span className="block text-xs">REX suivant</span>
                <span className="font-medium text-foreground">{rexSuiv.titre}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}

// Encapsule un graphique avec titre/indice (variante locale de ChartCard, sans dépendance circulaire).
function ChartFrame({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card data-reveal>
      <CardContent>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">{title}</p>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function RexDetailPage() {
  const { id } = useParams();
  return (
    <DataGate
      render={(d) => {
        const rex = d.rex.find((r) => r.id === id);
        if (!rex) {
          return (
            <EmptyState>
              REX introuvable.{' '}
              <Link to="/rex" className="text-primary hover:underline">
                Retour aux REX
              </Link>
            </EmptyState>
          );
        }
        return <RexDetail d={d} rex={rex} />;
      }}
    />
  );
}
