import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { nf } from '../lib/format';

interface CounterProps {
  value: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/** Compteur animé (count-up) en JetBrains Mono. Respecte reduced-motion. */
export function Counter({ value, decimals = 0, className, prefix = '', suffix = '' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const write = (n: number) => {
        el.textContent = `${prefix}${nf(n, decimals)}${suffix}`;
      };
      if (reduce) {
        write(value);
        return;
      }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => write(obj.v),
      });
    },
    { dependencies: [value, decimals, prefix, suffix] },
  );

  return (
    <span ref={ref} className={className}>
      {`${prefix}${nf(0, decimals)}${suffix}`}
    </span>
  );
}
