# Dashboard POC Claude · équipe SIX

Mini-site **statique** de suivi du POC Claude / Claude Code (6 mois, 3 REX). Il affiche les
KPI globaux et par métier, une timeline, des comparaisons avant/après IA, un catalogue de
cas d'usage et les synthèses de REX.

**Stack** : Vite · React · TypeScript · Tailwind CSS v4 · React Router · Recharts · GSAP.
Polices auto-hébergées **Inter** (texte) et **JetBrains Mono** (chiffres). Aucun backend,
aucun appel réseau externe.

> 🔗 **Démo en ligne** : https://ludodwt.github.io/cc-poc/ (publiée automatiquement à chaque
> push sur `main`).

## Prérequis

- **Node.js ≥ 20** (testé sur 22)
- **pnpm** (`corepack enable` puis `corepack prepare pnpm@latest --activate`, ou voir [pnpm.io](https://pnpm.io/installation))

## Démarrer en local

```bash
git clone git@github.com:LudoDWT/cc-poc.git
cd cc-poc
pnpm install        # une seule fois
pnpm dev            # http://localhost:8616
```

C'est tout : le site est servi à l'adresse ci-dessus, rechargement à chaud activé.

## Scripts

| Commande       | Effet                                                        |
| -------------- | ------------------------------------------------------------ |
| `pnpm dev`     | Serveur de développement (http://localhost:8616)             |
| `pnpm build`   | Vérifie les types (`tsc`) puis génère le build statique dans `dist/` |
| `pnpm preview` | Prévisualise le build de `dist/` (http://localhost:8616)     |

## Éditer les données

**Toute la donnée du dashboard vit dans un seul fichier :**

```
public/data/poc.json
```

Éditez-le, puis **rafraîchissez le navigateur**, aucun rebuild nécessaire en mode `dev`.
Le contrat (structure attendue) est documenté dans `src/types/poc.ts`.

> Les données livrées sont des **données d'EXEMPLE** (champ `_exemple: true`). Remplacez-les
> par les vrais chiffres du POC.

Sections du fichier : `meta`, `kpisGlobaux`, `metiers`, `casUsage`, `avantApres`, `rex`,
`timeline`.

## Déploiement (démo)

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) construit et publie
le site sur **GitHub Pages** à chaque push sur `main` (déclenchable aussi à la main depuis
l'onglet **Actions**).

**Activation (une seule fois)** : dans le dépôt GitHub → **Settings › Pages › Build and
deployment › Source** → choisir **GitHub Actions**.

Le site étant servi sous le sous-chemin `/cc-poc/`, le build CI passe la variable
`BASE_PATH=/cc-poc/` (voir `vite.config.ts`). Le routing utilise `BrowserRouter` (URLs propres,
sans `#`) ; le workflow copie `index.html` en `404.html` pour que les routes profondes
(rechargement sur `/kpi`, etc.) fonctionnent sur GitHub Pages.

### Héberger ailleurs

Le dossier `dist/` est 100 % statique. Pour tout autre hébergeur :

```bash
pnpm build                           # à la racine du domaine → base '/'
BASE_PATH=/sous-chemin/ pnpm build   # sous un sous-chemin
```

Pensez au **fallback SPA** : toute route inconnue doit renvoyer `index.html` (Netlify, Vercel
et Cloudflare Pages le font automatiquement ; sinon, copiez `index.html` en `404.html`).

## Fonctionnalités

- **Vue d'ensemble** : pitch, KPI héros, météo du POC, prochaine échéance, adoption, verbatims.
- **Timeline** : déroulé config → REX1/2/3 → bilan.
- **KPI** : indicateurs consolidés + graphiques (adoption, heures gagnées, temps par métier, maturité).
- **Métiers** : une vue par profil (PO, PM, QA, DEV, OPS, UI/UX, Sécurité, DATA).
- **Avant / Après** : comparaisons temps / effort / qualité, hall of fame des gains.
- **Cas d'usage** : catalogue filtrable (métier, maturité, recherche) + prompts.
- **REX** : synthèses, chiffres, freins et recommandations.

Bonus : thème clair/sombre, **mode présentation** (typo agrandie, chrome masqué) pour les
comités, animations GSAP au scroll respectant `prefers-reduced-motion`.

## Structure

```
public/data/poc.json   # LA source de données (à éditer)
src/
  types/poc.ts         # contrat TypeScript des données
  hooks/               # usePocData, useReveal (GSAP), use-mobile…
  lib/                 # format (fr), labels, gsap
  components/          # Layout, cartes, graphiques, KpiCard, Counter…
  pages/               # une page par vue
  App.tsx              # routeur
```
