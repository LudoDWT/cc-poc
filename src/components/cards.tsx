import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bug,
  Code2,
  Crown,
  Database,
  Map,
  Palette,
  Server,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import type { AvantApres, CasUsage, Metier, Meteo, Rex, Verbatim } from '../types/poc';
import { Badge, StatutPill } from './ui';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  LABEL_MATURITE,
  LABEL_REPLICABILITE,
  TONE_MATURITE,
  TONE_REPLICABILITE,
  couleurMetier,
} from '../lib/labels';
import { formatDateCourteFr } from '../lib/format';

const METEO: Record<Meteo, { dot: string; label: string }> = {
  vert: { dot: 'bg-success', label: 'Au vert' },
  orange: { dot: 'bg-warning', label: 'Vigilance' },
  rouge: { dot: 'bg-destructive', label: 'Alerte' },
};

export function MeteoBadge({ meteo }: { meteo: Meteo }) {
  const m = METEO[meteo];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dot} opacity-60`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${m.dot}`} />
      </span>
      <span className="font-medium text-foreground">{m.label}</span>
    </span>
  );
}

function MetierTag({ slug, nom }: { slug: string; nom: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: couleurMetier(slug) }} />
      {nom}
    </span>
  );
}

// Icône par métier (neutre, monochrome). Repli sur Users si le slug est inconnu.
const METIER_ICON: Record<string, ComponentType<{ className?: string }>> = {
  po: Target,
  pm: Map,
  qa: Bug,
  dev: Code2,
  ops: Server,
  uiux: Palette,
  securite: ShieldCheck,
  data: Database,
};

export function metierIcon(slug: string): ComponentType<{ className?: string }> {
  return METIER_ICON[slug] ?? Users;
}

/** Référent du métier, signalé par une couronne. */
export function Responsable({ nom }: { nom: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Crown className="size-3.5 text-amber-500" />
      {nom}
    </span>
  );
}

export function MetierCard({ metier }: { metier: Metier }) {
  const Icon = metierIcon(metier.slug);
  return (
    <Link
      to={`/metiers/${metier.slug}`}
      className="group flex h-full flex-col rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/20 hover:shadow-md"
      data-reveal
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon className="size-5" />
        </span>
        <h3 className="text-lg font-semibold">{metier.nom}</h3>
      </div>
      {metier.pitch && (
        <p className="mt-3 text-sm leading-snug text-muted-foreground">{metier.pitch}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        {metier.responsable && <Responsable nom={metier.responsable} />}
        <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
          Voir le détail
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}

export function CasUsageCard({ cas, metierNom }: { cas: CasUsage; metierNom?: string }) {
  return (
    <Card data-reveal className="gap-0 transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold">{cas.titre}</h3>
          <Badge tone="primary">{cas.outil}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <MetierTag slug={cas.metier} nom={metierNom ?? cas.metier} />
          <span className="text-xs text-muted-foreground">· {cas.auteur}</span>
          <span className="text-xs text-muted-foreground">· {formatDateCourteFr(cas.date)}</span>
        </div>

        <p className="mt-3 text-sm leading-snug text-muted-foreground">
          <span className="font-medium text-foreground">Méthode : </span>
          {cas.methode}
        </p>
        <p className="mt-2 text-sm leading-snug text-muted-foreground">
          <span className="font-medium text-foreground">Résultat : </span>
          {cas.resultat}
        </p>

        {/* Bloc ferré en bas de carte : effort / maturité / réplicabilité + tags */}
        <div className="mt-auto">
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">⏱ {cas.tempsGagne}</Badge>
            <Badge tone={TONE_MATURITE[cas.maturite]}>{LABEL_MATURITE[cas.maturite]}</Badge>
            <Badge tone={TONE_REPLICABILITE[cas.replicabilite]}>{LABEL_REPLICABILITE[cas.replicabilite]}</Badge>
          </div>

          {cas.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cas.tags.map((t) => (
                <span key={t} className="mono rounded bg-muted px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DotScale({ value, color }: { value: number; color: string }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: i < value ? color : 'var(--border)' }}
        />
      ))}
    </span>
  );
}

export function AvantApresCard({ item, metierNom }: { item: AvantApres; metierNom?: string }) {
  return (
    <Card data-reveal className="gap-0 overflow-hidden py-0">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <h3 className="text-base font-semibold">{item.titre}</h3>
          <div className="mt-1">
            <MetierTag slug={item.metier} nom={metierNom ?? item.metier} />
          </div>
        </div>
        <Badge tone="success">{item.gain}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-5">
          <p className="eyebrow mb-2 text-destructive">Avant</p>
          <p className="mono text-2xl font-semibold">{item.avant.temps}</p>
          <p className="mt-2 text-xs leading-snug text-muted-foreground">{item.avant.desc}</p>
          <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Effort</dt>
              <dd>
                <DotScale value={item.avant.effort} color="var(--destructive)" />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Qualité</dt>
              <dd>
                <DotScale value={item.avant.qualite} color="var(--muted-foreground)" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-card p-5">
          <p className="eyebrow mb-2 text-success">Après</p>
          <p className="mono text-2xl font-semibold">{item.apres.temps}</p>
          <p className="mt-2 text-xs leading-snug text-muted-foreground">{item.apres.desc}</p>
          <dl className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <dt>Effort</dt>
              <dd>
                <DotScale value={item.apres.effort} color="var(--success)" />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Qualité</dt>
              <dd>
                <DotScale value={item.apres.qualite} color="var(--success)" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Card>
  );
}

export function RexCard({ rex }: { rex: Rex }) {
  const aVenir = rex.statut === 'a-venir';
  return (
    <Card data-reveal className={aVenir ? 'opacity-70' : undefined}>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-semibold">{rex.titre}</h3>
            <span className="mono text-xs text-muted-foreground">{rex.periode}</span>
          </div>
          <StatutPill statut={rex.statut} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{rex.synthese}</p>

        {rex.chiffres.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rex.chiffres.map((c) => (
              <div key={c.label} className="rounded-lg bg-muted p-3">
                <p className="mono text-lg font-semibold">{c.valeur}</p>
                <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {(rex.aMarche.length > 0 || rex.freins.length > 0) && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {rex.aMarche.length > 0 && (
              <div>
                <p className="eyebrow mb-2 text-success">Ce qui a marché</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {rex.aMarche.map((x, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-success">+</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rex.freins.length > 0 && (
              <div>
                <p className="eyebrow mb-2 text-warning">Freins</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {rex.freins.map((x, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-warning">!</span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {rex.recommandation && (
          <div className="mt-4 rounded-lg bg-primary/10 p-3">
            <p className="eyebrow mb-1">Recommandation</p>
            <p className="text-sm text-foreground">{rex.recommandation}</p>
          </div>
        )}

        {rex.dossier && (
          <Link
            to={`/rex/${rex.id}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voir le dossier détaillé <ArrowRight className="size-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function VerbatimCard({ verbatim }: { verbatim: Verbatim }) {
  return (
    <figure
      className="flex flex-col rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
      data-reveal
    >
      <span className="mono text-3xl leading-none text-primary">“</span>
      <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground">
        {verbatim.citation}
      </blockquote>
      <figcaption className="mt-4 text-xs text-muted-foreground">
        {verbatim.auteur}
        {verbatim.metier ? ` · ${verbatim.metier}` : ''}
      </figcaption>
    </figure>
  );
}
