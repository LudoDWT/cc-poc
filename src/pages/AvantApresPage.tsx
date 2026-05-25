import { DataGate } from '../components/DataGate';
import { AvantApresCard } from '../components/cards';
import { ChartCard, EmptyState, Eyebrow, PageHeader } from '../components/ui';
import { HBar, type BarDatum } from '../components/charts';
import { Card, CardContent } from '@/components/ui/card';
import { couleurMetier } from '../lib/labels';

export default function AvantApresPage() {
  return (
    <DataGate
      render={(d) => {
        const metierNom = (slug: string) => d.metiers.find((m) => m.slug === slug)?.nom ?? slug;

        const sorted = [...d.avantApres].sort((a, b) => (b.gainPct ?? 0) - (a.gainPct ?? 0));
        const moyenne = d.avantApres.length
          ? Math.round(d.avantApres.reduce((s, a) => s + (a.gainPct ?? 0), 0) / d.avantApres.length)
          : 0;
        const hall: BarDatum[] = sorted
          .slice(0, 6)
          .map((a) => ({ label: a.titre, valeur: a.gainPct ?? 0, color: couleurMetier(a.metier) }));

        return (
          <>
            <PageHeader
              eyebrow="L'impact concret"
              title="Avant / Après IA"
              intro="Pour chaque tâche, le même travail avant et après l'introduction de l'IA : temps, effort et qualité."
            />

            {d.avantApres.length === 0 ? (
              <EmptyState>
                Aucune comparaison avant/après pour le moment — elles seront ajoutées dès les premiers
                usages du POC.
              </EmptyState>
            ) : (
              <>
                <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
                  <Card data-reveal className="justify-center">
                    <CardContent>
                      <Eyebrow>Gain de temps moyen</Eyebrow>
                      <p className="mono mt-2 text-5xl font-semibold text-success">−{moyenne}%</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        sur les {d.avantApres.length} tâches documentées
                      </p>
                    </CardContent>
                  </Card>
                  {hall.length > 0 && (
                    <ChartCard title="Hall of fame — plus gros gains" hint="% de temps gagné">
                      <HBar data={hall} unite=" %" />
                    </ChartCard>
                  )}
                </section>

                <section>
                  <Eyebrow>Toutes les comparaisons</Eyebrow>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {sorted.map((a) => (
                      <AvantApresCard key={a.id} item={a} metierNom={metierNom(a.metier)} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        );
      }}
    />
  );
}
