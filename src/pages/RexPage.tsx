import { DataGate } from '../components/DataGate';
import { RexCard } from '../components/cards';
import { PageHeader } from '../components/ui';

export default function RexPage() {
  return (
    <DataGate
      render={(d) => (
        <>
          <PageHeader
            eyebrow="Restitution externe"
            title="REX externe"
            intro="Ce que nous présentons aux parties prenantes, à chaque jalon bimestriel (M2, M4, M6) : synthèse, chiffres clés, freins et recommandation."
          />
          <div className="space-y-6">
            {d.rex.map((r) => (
              <RexCard key={r.id} rex={r} />
            ))}
          </div>
        </>
      )}
    />
  );
}
