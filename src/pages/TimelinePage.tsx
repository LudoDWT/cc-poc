import { DataGate } from '../components/DataGate';
import { PageHeader, StatutPill } from '../components/ui';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateCourteFr, formatDateFr } from '../lib/format';
import type { StatutJalon } from '../types/poc';

const DOT: Record<StatutJalon, string> = {
  fait: 'bg-success border-success',
  'en-cours': 'bg-primary border-primary',
  'a-venir': 'bg-card border-muted-foreground/40',
};

export default function TimelinePage() {
  return (
    <DataGate
      render={(d) => (
        <>
          <PageHeader
            eyebrow="Déroulé du POC"
            title="Timeline"
            intro="Une phase de setup en amont (hors des 6 mois), puis 6 mois de POC rythmés par 3 REX bimestriels, et enfin le bilan."
          />

          {/* Les 3 macro-phases */}
          <div className="mb-12 grid gap-3 sm:grid-cols-3">
            <Card data-reveal>
              <CardContent>
                <p className="eyebrow">Amont</p>
                <p className="mt-1 font-semibold">Setup &amp; configuration</p>
                <p className="mt-1 text-xs text-muted-foreground">Hors des 6 mois</p>
                <p className="mono mt-2 text-xs text-muted-foreground">
                  {formatDateCourteFr(d.meta.dateConfig)} → {formatDateCourteFr(d.meta.dateM0)}
                </p>
              </CardContent>
            </Card>
            <Card data-reveal className="border-primary ring-1 ring-primary/20">
              <CardContent>
                <p className="eyebrow text-primary">Le POC · 6 mois</p>
                <p className="mt-1 font-semibold">3 REX bimestriels</p>
                <p className="mt-1 text-xs text-muted-foreground">REX1 · M2 → REX2 · M4 → REX3 · M6</p>
                <p className="mono mt-2 text-xs text-muted-foreground">
                  {formatDateCourteFr(d.meta.dateM0)} → {formatDateCourteFr(d.meta.dateRex3)}
                </p>
              </CardContent>
            </Card>
            <Card data-reveal>
              <CardContent>
                <p className="eyebrow">Aval</p>
                <p className="mt-1 font-semibold">Bilan &amp; décision</p>
                <p className="mt-1 text-xs text-muted-foreground">Généralisation ?</p>
                <p className="mono mt-2 text-xs text-muted-foreground">
                  {formatDateCourteFr(d.meta.dateBilan)}
                </p>
              </CardContent>
            </Card>
          </div>

          <ol className="relative ml-2 border-l">
            {d.timeline.map((j) => (
              <li key={`${j.date}-${j.label}`} className="relative mb-9 pl-8" data-reveal>
                <span className="absolute -left-[7px] top-1 h-3.5 w-3.5">
                  {j.statut === 'en-cours' && (
                    // Pulsation continue sur la période en cours uniquement (désactivée si reduced-motion).
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                  )}
                  <span
                    className={`relative block h-3.5 w-3.5 rounded-full border-2 ${DOT[j.statut]} ${
                      j.statut === 'en-cours' ? 'ring-4 ring-primary/20' : ''
                    }`}
                  />
                </span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="mono text-xs text-muted-foreground">{formatDateFr(j.date)}</span>
                  <StatutPill statut={j.statut} />
                </div>
                <h3 className="mt-1 text-lg font-semibold">{j.label}</h3>
                {j.desc && <p className="mt-1 text-sm leading-snug text-muted-foreground">{j.desc}</p>}
                {j.responsable && (
                  <p className="mono mt-1 text-xs text-muted-foreground/80">Pilote : {j.responsable}</p>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    />
  );
}
