import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DataGate } from '../components/DataGate';
import { KpiCard } from '../components/KpiCard';
import { AvantApresCard, CasUsageCard, Responsable, VerbatimCard, metierIcon } from '../components/cards';
import { EmptyState, Eyebrow } from '../components/ui';

export default function MetierDetail() {
  const { slug } = useParams();

  return (
    <DataGate
      render={(d) => {
        const m = d.metiers.find((x) => x.slug === slug);
        if (!m) {
          return (
            <EmptyState>
              Métier introuvable.{' '}
              <Link to="/metiers" className="text-primary hover:underline">
                Retour à la liste
              </Link>
            </EmptyState>
          );
        }

        const Icon = metierIcon(m.slug);
        const cas = d.casUsage.filter((c) => m.casUsageIds.includes(c.id));
        const aps = d.avantApres.filter((a) => m.avantApresIds.includes(a.id));

        return (
          <>
            <Link
              to="/metiers"
              className="mono mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              data-reveal
            >
              <ArrowLeft className="size-4" /> Tous les métiers
            </Link>

            <header className="mb-10" data-reveal>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground">
                  <Icon className="size-6" />
                </span>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{m.nom}</h1>
                {m.responsable && <Responsable nom={m.responsable} />}
              </div>
              {m.pitch && <p className="mt-4 max-w-2xl text-base text-muted-foreground">{m.pitch}</p>}
            </header>

            {m.kpis.length === 0 &&
              cas.length === 0 &&
              aps.length === 0 &&
              m.verbatims.length === 0 && (
                <EmptyState>
                  Données à venir pour ce métier : indicateurs, cas d'usage, gains et verbatims
                  seront ajoutés au fil du POC.
                </EmptyState>
              )}

            {m.kpis.length > 0 && (
              <section className="mb-12">
                <Eyebrow>Indicateurs du métier</Eyebrow>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {m.kpis.map((k) => (
                    <KpiCard key={k.id} kpi={k} />
                  ))}
                </div>
              </section>
            )}

            {aps.length > 0 && (
              <section className="mb-12">
                <Eyebrow>Avant / Après</Eyebrow>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {aps.map((a) => (
                    <AvantApresCard key={a.id} item={a} metierNom={m.nom} />
                  ))}
                </div>
              </section>
            )}

            {cas.length > 0 && (
              <section className="mb-12">
                <Eyebrow>Cas d'usage</Eyebrow>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {cas.map((c) => (
                    <CasUsageCard key={c.id} cas={c} metierNom={m.nom} />
                  ))}
                </div>
              </section>
            )}

            {m.verbatims.length > 0 && (
              <section>
                <Eyebrow>Verbatims</Eyebrow>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {m.verbatims.map((v, i) => (
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
