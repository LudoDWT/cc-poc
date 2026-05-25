import { DataGate } from '../components/DataGate';
import { MetierCard } from '../components/cards';
import { PageHeader } from '../components/ui';

export default function Metiers() {
  return (
    <DataGate
      render={(d) => (
        <>
          <PageHeader
            eyebrow="Par profil"
            title="Vue par métier"
            intro="Chaque métier de l'équipe SIX a ses propres cas d'usage et ses propres gains. Cliquez pour le détail."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {d.metiers.map((m) => (
              <MetierCard key={m.slug} metier={m} />
            ))}
          </div>
        </>
      )}
    />
  );
}
