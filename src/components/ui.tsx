import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { StatutJalon } from '../types/poc';
import { LABEL_STATUT } from '../lib/labels';
import { cn } from '@/lib/utils';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-10 max-w-3xl">
      <p className="eyebrow mb-3" data-reveal>
        {eyebrow}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" data-reveal>
        {title}
      </h1>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground" data-reveal>
          {intro}
        </p>
      )}
      {children}
    </header>
  );
}

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wide',
  {
    variants: {
      tone: {
        neutral: 'border-transparent bg-secondary text-secondary-foreground',
        primary: 'border-transparent bg-primary/10 text-primary',
        success: 'border-transparent bg-success/15 text-success',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        warning: 'border-transparent bg-warning/15 text-warning',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export function Badge({ children, tone }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={badgeVariants({ tone })}>{children}</span>;
}

const STATUT_DOT: Record<StatutJalon, string> = {
  fait: 'bg-success',
  'en-cours': 'bg-primary',
  'a-venir': 'bg-muted-foreground/40',
};

export function StatutPill({ statut }: { statut: StatutJalon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-transparent px-2.5 py-0.5 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUT_DOT[statut]}`} />
      {LABEL_STATUT[statut]}
    </span>
  );
}

export function Card({
  children,
  className,
  reveal = false,
}: {
  children: ReactNode;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <ShadcnCard className={cn(className)} {...(reveal ? { 'data-reveal': '' } : {})}>
      {children}
    </ShadcnCard>
  );
}

export function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <ShadcnCard data-reveal>
      <CardHeader className="flex flex-row items-baseline justify-between gap-3 space-y-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </ShadcnCard>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground"
      data-reveal
    >
      {children}
    </div>
  );
}
