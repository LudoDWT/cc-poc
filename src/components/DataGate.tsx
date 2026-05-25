import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import type { PocData } from '../types/poc';
import { usePocData } from '../hooks/usePocData';
import { useReveal } from '../hooks/useReveal';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Charge les données et gère les états (chargement / erreur), avec révélation au scroll. */
export function DataGate({ render }: { render: (data: PocData) => ReactNode }) {
  const { data, error, loading } = usePocData();
  const scope = useReveal<HTMLDivElement>([data ? 'ready' : loading ? 'loading' : 'error']);

  return (
    <div ref={scope}>
      {loading && (
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-2/3 max-w-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      )}
      {error && (
        <Card className="border-destructive/40">
          <CardContent className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Erreur de chargement</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Vérifiez la présence de <span className="mono">public/data/poc.json</span>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {data && render(data)}
    </div>
  );
}
