import { DataGate } from '../components/DataGate';
import { KpiCard } from '../components/KpiCard';
import { ChartCard, Eyebrow, PageHeader } from '../components/ui';
import { Donut, HBar, SerieLine, type BarDatum, type DonutDatum } from '../components/charts';
import { couleurMetier, LABEL_MATURITE } from '../lib/labels';
import type { Maturite } from '../types/poc';

const MATURITE_ORDER: Maturite[] = ['idee', 'teste', 'adopte', 'industrialise'];

const MATURITE_COLOR: Record<Maturite, string> = {
  idee: 'var(--muted-foreground)',
  teste: 'var(--warning)',
  adopte: 'var(--primary)',
  industrialise: 'var(--success)',
};

export default function KpiPage() {
  return (
    <DataGate
      render={(d) => {
        const adoption = d.kpisGlobaux.find((k) => k.id === 'taux-adoption');
        const heures = d.kpisGlobaux.find((k) => k.id === 'heures-gagnees');
        const taches = d.kpisGlobaux.find((k) => k.id === 'taches-assistees');
        const casDeployes = d.kpisGlobaux.find((k) => k.id === 'cas-usage-deployes');

        const tempsParMetier: BarDatum[] = d.metiers
          .flatMap((m) => {
            const k = m.kpis.find((x) => x.label.toLowerCase().includes('temps gagné'));
            return k ? [{ label: m.nom, valeur: k.valeur, color: couleurMetier(m.slug) }] : [];
          })
          .sort((a, b) => b.valeur - a.valeur);

        const maturiteData: DonutDatum[] = MATURITE_ORDER.map((mat) => ({
          label: LABEL_MATURITE[mat],
          valeur: d.casUsage.filter((cu) => cu.maturite === mat).length,
          color: MATURITE_COLOR[mat],
        })).filter((x) => x.valeur > 0);

        return (
          <>
            <PageHeader
              eyebrow="Mesure de la valeur"
              title="KPI globaux"
              intro="Adoption, productivité, qualité et retour sur investissement, consolidés à l'échelle du POC."
            />

            <section className="mb-12">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {d.kpisGlobaux.map((k) => (
                  <KpiCard key={k.id} kpi={k} />
                ))}
              </div>
            </section>

            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              {adoption?.historique && (
                <ChartCard title="Adoption" hint="utilisateurs actifs">
                  <SerieLine data={adoption.historique} color="var(--primary)" />
                </ChartCard>
              )}
              {heures?.historique && (
                <ChartCard title="Heures gagnées (cumul)" hint="en heures">
                  <SerieLine data={heures.historique} unite=" h" color="var(--primary)" />
                </ChartCard>
              )}
              {taches?.historique && (
                <ChartCard title="Tâches assistées (cumul)" hint="nombre de tâches">
                  <SerieLine data={taches.historique} color="var(--primary)" />
                </ChartCard>
              )}
              {casDeployes?.historique && (
                <ChartCard title="Cas d'usage déployés (cumul)" hint="nombre de cas">
                  <SerieLine data={casDeployes.historique} color="var(--primary)" />
                </ChartCard>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {tempsParMetier.length > 0 && (
                <ChartCard title="Temps gagné par semaine, par métier" hint="heures / semaine">
                  <HBar data={tempsParMetier} unite=" h" />
                </ChartCard>
              )}
              {maturiteData.length > 0 && (
                <ChartCard title="Cas d'usage par maturité">
                  <Donut data={maturiteData} />
                  <ul className="mt-4 space-y-1.5">
                    {maturiteData.map((m) => (
                      <li key={m.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
                        {m.label}
                        <span className="mono ml-auto text-foreground">{m.valeur}</span>
                      </li>
                    ))}
                  </ul>
                </ChartCard>
              )}
            </section>

            <div className="mt-8 text-xs text-muted-foreground">
              <Eyebrow>Note méthodo</Eyebrow>
              <span className="mt-1 block">
                Les heures gagnées et le ROI sont des estimations déclaratives, la méthode de mesure
                (déclaratif vs logs d'usage) reste à arbitrer (cf. cadrage).
              </span>
            </div>
          </>
        );
      }}
    />
  );
}
