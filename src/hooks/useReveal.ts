import { useRef, type RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

/**
 * Révèle au scroll tous les éléments marqués [data-reveal] dans le conteneur.
 * - Animation par lots (ScrollTrigger.batch) avec léger stagger.
 * - Respecte prefers-reduced-motion (affichage immédiat sans animation).
 * - Nettoyage automatique via useGSAP au démontage / changement de page.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = [],
): RefObject<T> {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
        if (items.length === 0) return;
        gsap.set(items, { autoAlpha: 0, y: 26 });
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 90%',
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              stagger: 0.08,
              overwrite: true,
            }),
        });
        ScrollTrigger.refresh();
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set('[data-reveal]', { autoAlpha: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope, dependencies: deps },
  );

  return scope;
}
