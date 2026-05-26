# CLAUDE.md

Guide pour travailler efficacement dans ce dépôt. Pour le setup utilisateur, voir `README.md`.

## Le projet en deux lignes

Dashboard **statique** de suivi du POC Claude / Claude Code de l'équipe SIX (6 mois, 3 REX).
Vite + React 18 + TypeScript + Tailwind CSS v4 + React Router + Recharts + GSAP. Aucun backend, aucun appel réseau externe.

## Commandes

```bash
pnpm install              # pnpm uniquement (packageManager figé), pas npm/yarn
pnpm dev                  # http://localhost:8616 (port strict)
pnpm build                # tsc (type-check strict) PUIS vite build -> dist/
pnpm preview              # prévisualise dist/ sur le même port
BASE_PATH=/cc-poc/ pnpm build   # build pour un sous-chemin (cf. déploiement)
```

Pas de runner de test ni d'ESLint configurés : la **vérification, c'est `pnpm build`** (le `tsc` est strict, voir Pièges).

## Architecture

**Toute la donnée vit dans un seul fichier** : `public/data/poc.json`. Le contrat TypeScript est `src/types/poc.ts` (la source de vérité des structures). En `dev`, éditer le JSON puis rafraîchir suffit (aucun rebuild).

Flux de données :
- `src/hooks/usePocData.ts` : fetch unique de `${import.meta.env.BASE_URL}data/poc.json`, mis en cache (singleton) pour toute l'app.
- `src/components/DataGate.tsx` : enveloppe une page, gère les états chargement (squelette) / erreur, et appelle `render(data)`.
- Une page type fait : `<DataGate render={(d) => ...} />`.

Organisation :
- `src/pages/` : une page par vue (route). Les pages sont **lazy-loaded** dans `src/App.tsx` (`React.lazy`), avec un `Suspense` autour de l'`Outlet` dans `Layout.tsx`.
- `src/components/` : `Layout` (shell sidebar + header, eager), `cards.tsx` (cartes métier/cas/REX/verbatim), `charts.tsx` (wrappers Recharts : `Sparkline`, `SerieLine`, `HBar`, `Donut`), `KpiCard`, `Counter` (count-up GSAP), `ui.tsx` (`PageHeader`, `Eyebrow`, `Badge`, `StatutPill`, `ChartCard`, `EmptyState`).
- `src/components/ui/` : primitives shadcn (ne pas réinventer ; les réutiliser).
- `src/hooks/` : `usePocData`, `useReveal` (révélation GSAP au scroll via `data-reveal`), `usePageTransition`, `use-mobile`.
- `src/lib/` : `format.ts` (formatage fr : `nf`, `formatDateFr`), `labels.ts` (libellés + tons de badge + couleurs métier), `gsap.ts` (réexport gsap + `useGSAP`), `utils.ts` (`cn`).

## Routing et déploiement (pièges importants)

- Routeur : **`BrowserRouter`** (URLs propres, sans `#`), avec `basename={import.meta.env.BASE_URL}` dans `src/main.tsx`. L'hôte doit renvoyer `index.html` en fallback sur les routes profondes.
- `vite.config.ts` lit `base: process.env.BASE_PATH ?? '/'`. En local : `/`. En CI : `/cc-poc/`.
- Déploiement : `.github/workflows/deploy.yml` build avec `BASE_PATH=/cc-poc/`, copie `index.html` en `404.html` (fallback SPA GitHub Pages), publie sur GitHub Pages à chaque push sur `main`. Démo : https://ludodwt.github.io/cc-poc/
- Conséquence : sur GitHub Pages, une route profonde renvoie un **statut HTTP 404** mais sert le contenu de l'app (limite connue, normal). En local le serveur Vite gère le fallback.

## Conventions

- **Contenu en français.** Identifiants de code en anglais.
- **Jamais de tiret cadratin** (em dash, U+2014) dans le contenu. Remplacer selon le contexte : libellé -> « : », apposition -> « , », marque -> « · », séquence -> « → ».
- **Tons de badge sémantiques** centralisés dans `src/lib/labels.ts` (`TONE_MATURITE`, `TONE_REPLICABILITE`, `TONE_CONFORMITE`, `TONE_NIVEAU`). Ne pas hardcoder de couleurs dans les pages.
- Animations : ajouter `data-reveal` sur un élément pour la révélation au scroll (GSAP, respecte `prefers-reduced-motion`).
- Tailwind v4 (config via `@tailwindcss/vite`, pas de `tailwind.config.js`). **Thème sombre uniquement** : la classe `dark` est figée sur `<html>` dans `index.html` (aucun toggle). La palette claire (`:root` dans `src/index.css`) reste définie mais inerte ; pour réactiver un sélecteur clair/sombre, recréer un bouton qui bascule la classe `dark`.
- Alias d'import : `@/` -> `src/`.

## Recettes courantes

- **Modifier le contenu affiché** : éditer `public/data/poc.json` (sections `meta`, `kpisGlobaux`, `metiers`, `casUsage`, `avantApres`, `rex`, `timeline`, `questionnaires`). Respecter `src/types/poc.ts`.
- **Ajouter une page** : créer `src/pages/MaPage.tsx`, l'ajouter en `lazy(() => import(...))` + `<Route>` dans `src/App.tsx`, et une entrée dans `NAV` (`src/components/Layout.tsx`).
- **Ajouter un graphique** : réutiliser un wrapper de `src/components/charts.tsx` dans une `ChartCard`.
- **Dossier REX détaillé** : page `src/pages/RexDetailPage.tsx` (route `/rex/:id`), alimentée par `rex[].dossier` dans le JSON (type `DossierRex`). Sommaire latéral sticky + scroll-spy.

## Pièges

- `tsconfig` strict avec `noUnusedLocals` / `noUnusedParameters` : tout import ou variable inutilisé **casse le build**. Nettoyer les imports (ex. retirer une icône lucide devenue inutile).
- Les données livrées sont des **exemples** (`_exemple: true` dans `poc.json`). À remplacer par les vraies mesures.
- `usePocData` met la donnée en cache : un même fetch sert toutes les pages.
