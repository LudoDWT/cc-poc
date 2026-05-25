import { useRef, type RefObject } from 'react';
import { gsap, useGSAP } from '../lib/gsap';

/**
 * Transition d'entrée du contenu à chaque changement de route (clé).
 * - Léger fondu + translation verticale, ease power2.out.
 * - Respecte prefers-reduced-motion (affichage immédiat).
 */
export function usePageTransition<T extends HTMLElement = HTMLDivElement>(
  key: string,
): RefObject<T> {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        );
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (ref.current) gsap.set(ref.current, { autoAlpha: 1, y: 0 });
      });
      return () => mm.revert();
    },
    { dependencies: [key] },
  );

  return ref;
}
