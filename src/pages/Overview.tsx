import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { DataGate } from '../components/DataGate';
import { KpiCard } from '../components/KpiCard';
import { MeteoBadge, VerbatimCard } from '../components/cards';
import { Eyebrow } from '../components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateFr, joursRestants } from '../lib/format';
import type { StatutJalon } from '../types/poc';

// Pastilles de la mini-timeline, alignées sur la timeline complète (cf. TimelinePage).
const DOT: Record<StatutJalon, string> = {
  fait: 'bg-success border-success',
  'en-cours': 'bg-primary border-primary',
  'a-venir': 'bg-card border-muted-foreground/40',
};

export default function Overview() {
  return (
    <DataGate
      render={(d) => {
        const jours = joursRestants(d.meta.prochaineEcheance.date);
        const prochains = d.timeline.filter((j) => j.statut !== 'fait').slice(0, 6);
        const verbatims = d.metiers.flatMap((m) => m.verbatims).slice(0, 3);
        const demarre = Date.now() >= new Date(d.meta.dateM0).getTime();

        return (
          <>
            {/* Hero */}
            <section className="mb-12 grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
              <div>
                <p className="eyebrow mb-3" data-reveal>
                  {d.meta.sousTitre}
                </p>
                <h1
                  className="text-4xl font-semibold tracking-tight sm:text-5xl"
                  data-reveal
                >
                  {d.meta.nom}
                </h1>
              </div>

              <Card data-reveal>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Eyebrow>État du POC</Eyebrow>
                    <MeteoBadge meteo={d.meta.meteo} />
                  </div>
                  <div className="mt-5">
                    <p className="text-xs text-muted-foreground">Prochaine échéance</p>
                    <p className="mt-1 text-lg font-semibold">
                      {d.meta.prochaineEcheance.label} · {formatDateFr(d.meta.prochaineEcheance.date)}
                    </p>
                    <p className="mono mt-1 text-sm text-primary">
                      {jours > 0 ? `dans ${jours} jours` : jours === 0 ? "aujourd'hui" : 'échéance passée'}
                    </p>
                  </div>
                  {d.meta.meteoCommentaire && (
                    <p className="mt-4 border-t pt-4 text-xs leading-snug text-muted-foreground">
                      {d.meta.meteoCommentaire}
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* KPI héros */}
            <section className="mb-12">
              <Eyebrow>Indicateurs clés</Eyebrow>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {d.kpisGlobaux.map((k) => (
                  <KpiCard key={k.id} kpi={k} />
                ))}
              </div>
            </section>

            {/* Adoption (si données) ou objectifs (pré-lancement) + prochaines échéances */}
            <section className="mb-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card data-reveal>
                <CardContent>
                  <h3 className="mb-4 text-sm font-semibold">Objectifs du POC</h3>

                  {d.meta.objectifs && d.meta.objectifs.length > 0 && (
                    <ul className="mb-6 space-y-2.5">
                      {d.meta.objectifs.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span className="text-sm leading-snug text-muted-foreground">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <hr className="mb-5 border-border" />
                  <h3 className="mb-3 text-sm font-semibold">Cibles chiffrées</h3>
                  <ul>
                    {d.kpisGlobaux
                      .filter((k) => k.cible != null)
                      .map((k) => (
                        <li key={k.id} className="flex items-baseline justify-between py-2.5">
                          <span className="text-sm text-muted-foreground">{k.label}</span>
                          <span className="mono text-sm font-semibold">
                            {k.cible}
                            {k.unite}
                          </span>
                        </li>
                      ))}
                  </ul>
                  {!demarre && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Les mesures démarreront au lancement du POC (15 juin 2026).
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card data-reveal>
                <CardContent className="flex flex-1 flex-col">
                  <h3 className="mb-1 text-sm font-semibold">Résumé de la timeline</h3>
                  <p className="mb-4 text-xs text-muted-foreground">
                    POC sur 6 mois · 3 REX bimestriels · bilan en janvier 2027
                  </p>
                  <ol className="relative ml-1 space-y-4 border-l">
                    {prochains.map((j) => {
                      const reste = joursRestants(j.date);
                      return (
                        <li key={j.date} className="relative flex items-start gap-3 pl-6" data-reveal>
                          <span className="absolute -left-[7px] top-1 h-3.5 w-3.5">
                            {j.statut === 'en-cours' && (
                              // Pulsation continue sur la période en cours (off si reduced-motion).
                              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                            )}
                            <span
                              className={`relative block h-3.5 w-3.5 rounded-full border-2 ${DOT[j.statut]} ${
                                j.statut === 'en-cours' ? 'ring-4 ring-primary/20' : ''
                              }`}
                            />
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{j.label}</p>
                            <p className="mono text-xs text-muted-foreground">{formatDateFr(j.date)}</p>
                          </div>
                          {j.statut === 'en-cours' ? (
                            <span className="mono shrink-0 text-xs font-medium text-primary">en cours</span>
                          ) : (
                            reste > 0 && (
                              <span className="mono shrink-0 text-xs text-muted-foreground">
                                dans {reste}&nbsp;j
                              </span>
                            )
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  <Link
                    to="/timeline"
                    className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-primary hover:underline"
                  >
                    Voir la timeline détaillée <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            </section>

            {/* Verbatims */}
            {verbatims.length > 0 && (
              <section>
                <Eyebrow>Ils en parlent</Eyebrow>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {verbatims.map((v, i) => (
                    <VerbatimCard key={i} verbatim={v} />
                  ))}
                </div>
              </section>
            )}
          </>
        );
      }}
    />
  );
}
