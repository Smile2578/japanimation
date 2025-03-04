# Traducteur Japonais Interactif

Une application Next.js pour l'apprentissage du japonais avec des animations interactives et une traduction alimentée par Claude d'Anthropic.

## Fonctionnalités

- Traduction entre le japonais, le français et l'anglais
- Animations des caractères japonais et de leur prononciation
- Synthèse vocale pour la prononciation japonaise
- Design moderne et responsive

## Configuration

### Prérequis

- Node.js 18.0.0 ou supérieur
- Une clé API Anthropic pour Claude

### Installation

1. Clonez ce dépôt
2. Installez les dépendances:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### Configuration de l'API Anthropic

Pour utiliser la fonctionnalité de traduction, vous avez besoin d'une clé API Anthropic:

1. Créez un compte sur [Anthropic](https://www.anthropic.com/) et obtenez une clé API
2. Copiez le fichier `.env.local.example` en `.env.local`
3. Remplacez `votre_clé_api_anthropic` par votre clé API réelle

```
ANTHROPIC_API_KEY=votre_clé_api_anthropic
```

## Développement

Lancez le serveur de développement:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir l'application.

## Technologies utilisées

- Next.js 14 avec App Router
- TypeScript
- Tailwind CSS
- Kuroshiro pour la romanisation du japonais
- API Claude d'Anthropic pour la traduction
- ShadCN UI pour les composants d'interface

## Déploiement

L'application peut être déployée sur Vercel ou toute autre plateforme supportant Next.js.
