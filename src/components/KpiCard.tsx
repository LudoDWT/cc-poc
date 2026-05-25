import type { Kpi } from '../types/poc';
import { Counter } from './Counter';
import { Sparkline } from './charts';
import { Card, CardContent } from '@/components/ui/card';
import { nf } from '../lib/format';

export function KpiCard({ kpi, accent }: { kpi: Kpi; accent?: string }) {
  // Tendance déduite du signe de la variation : couleur verte si +, rouge si −, neutre si nul.
  const sens =
    kpi.variation == null
      ? null
      : kpi.variation > 0
        ? 'hausse'
        : kpi.variation < 0
          ? 'baisse'
          : 'stable';
  const trendTone =
    sens === 'hausse'
      ? 'text-success'
      : sens === 'baisse'
        ? 'text-destructive'
        : 'text-muted-foreground';
  const pctCible =
    kpi.cible != null ? Math.min(100, Math.round((kpi.valeur / kpi.cible) * 100)) : null;
  const atteint = kpi.cible != null && kpi.valeur >= kpi.cible;

  return (
    <Card data-reveal className="h-full gap-0 transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground">{kpi.label}</p>
          {kpi.variation != null && (
            <span className={`mono shrink-0 text-xs ${trendTone}`}>
              {sens === 'stable' ? 'stable' : `${kpi.variation > 0 ? '+' : ''}${kpi.variation}%`}
            </span>
          )}
        </div>

        <Counter
          value={kpi.valeur}
          decimals={kpi.decimales ?? 0}
          suffix={kpi.unite}
          className="mono text-3xl font-semibold tracking-tight sm:text-4xl"
        />

        {kpi.historique && kpi.historique.length > 1 && (
          <Sparkline data={kpi.historique} color={accent} />
        )}

        {/* Bloc bas ancré : aligne barres et aides en pied de carte sur toute la grille. */}
        <div className="mt-auto flex flex-col gap-3 pt-3">
          {/* POC démarré : la barre situe la valeur par rapport à la cible.
              En pré-lancement (valeur à 0), pas de rappel de cible ici : il est déjà
              affiché dans la section « Cibles chiffrées » en bas de page. */}
          {kpi.cible != null && kpi.valeur > 0 && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  Cible&nbsp;{nf(kpi.cible)}
                  {kpi.unite}
                </span>
                <span className={`mono ${atteint ? 'font-medium text-success' : ''}`}>
                  {atteint ? '✓ atteint' : `${pctCible}%`}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${pctCible}%`,
                    backgroundColor: atteint ? 'var(--success)' : (accent ?? 'var(--primary)'),
                  }}
                />
              </div>
            </div>
          )}

          {kpi.aide && (
            <p className="text-xs leading-snug text-muted-foreground/80">{kpi.aide}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
