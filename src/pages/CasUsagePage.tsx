import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { usePocData } from '../hooks/usePocData';
import { useReveal } from '../hooks/useReveal';
import { CasUsageCard } from '../components/cards';
import { EmptyState, PageHeader } from '../components/ui';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { LABEL_MATURITE } from '../lib/labels';
import type { Maturite } from '../types/poc';

const MATURITES: Maturite[] = ['idee', 'teste', 'adopte', 'industrialise'];

export default function CasUsagePage() {
  const { data, error, loading } = usePocData();
  const [metier, setMetier] = useState('all');
  const [maturite, setMaturite] = useState<'all' | Maturite>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    return data.casUsage.filter(
      (c) =>
        (metier === 'all' || c.metier === metier) &&
        (maturite === 'all' || c.maturite === maturite) &&
        (needle === '' ||
          `${c.titre} ${c.methode} ${c.resultat} ${c.tags.join(' ')} ${c.auteur}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [data, metier, maturite, q]);

  // Ne dépend que de l'état de chargement : l'animation de révélation joue une
  // seule fois (au chargement des données), pas à chaque frappe ou filtre.
  const scope = useReveal<HTMLDivElement>([data ? 'r' : loading ? 'l' : 'e']);
  const metierNom = (slug: string) => data?.metiers.find((m) => m.slug === slug)?.nom ?? slug;

  return (
    <div ref={scope}>
      <PageHeader
        eyebrow="Catalogue"
        title="Cas d'usage"
        intro="Ce qu'on a fait, comment, et avec quel résultat. Filtrez par métier, maturité ou mot-clé."
      />

      {loading && <p className="mono text-sm text-muted-foreground">Chargement des données…</p>}
      {error && (
        <Card className="border-destructive/40">
          <CardContent>
            <p className="text-destructive">Erreur : {error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3" data-reveal>
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher…"
                className="pl-9"
                aria-label="Rechercher un cas d'usage"
              />
            </div>
            <Select value={metier} onValueChange={setMetier}>
              <SelectTrigger className="w-[12rem]" aria-label="Filtrer par métier">
                <SelectValue placeholder="Tous les métiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les métiers</SelectItem>
                {data.metiers.map((m) => (
                  <SelectItem key={m.slug} value={m.slug}>
                    {m.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={maturite} onValueChange={(v) => setMaturite(v as 'all' | Maturite)}>
              <SelectTrigger className="w-[11rem]" aria-label="Filtrer par maturité">
                <SelectValue placeholder="Toutes maturités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes maturités</SelectItem>
                {MATURITES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {LABEL_MATURITE[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="mono text-xs text-muted-foreground">{filtered.length} cas</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState>Aucun cas d'usage ne correspond à ces filtres.</EmptyState>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((c) => (
                <CasUsageCard key={c.id} cas={c} metierNom={metierNom(c.metier)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
