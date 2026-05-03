# 🐾 Veto-Care — Extranet Clinique Vétérinaire

## 👥 Binôme
- Étudiant 1 : [Votre Nom Prénom]
- Étudiant 2 : [Nom Prénom Binôme]

## 🔗 Liens
- **Application en ligne** : https://veto-care-mon-dossier.vercel.app
- **Dépôt GitHub** : https://github.com/ihocine-sketch/veto-care-mon-dossier

## 🗺️ Mapping du Thème

| Élément | Correspondance dans Veto-Care |
|---------|-------------------------------|
| **Table A** | Maîtres (propriétaires d'animaux) — gérés via Supabase Auth |
| **Table B** | Vétérinaires (nom, prénom, spécialité) |
| **Table C** | Rendez-vous (relie un maître à un vétérinaire, avec date et statut) |
| **Fichier** | Carnet de santé de l'animal (PDF ou image uploadé via Supabase Storage) |

## 🏗️ Analyse d'Architecture Cloud

### 1. Pourquoi Vercel + Supabase est financièrement plus logique ? (CAPEX vs OPEX)

Dans un modèle classique, lancer un projet nécessite un investissement initial important appelé **CAPEX** (Capital Expenditure) : achat de serveurs physiques, installation dans un data center, licences logicielles, et infrastructure réseau. Ces coûts sont fixes et doivent être payés avant même d'avoir un seul utilisateur.

Avec Vercel et Supabase, on passe à un modèle **OPEX** (Operational Expenditure) : on paye uniquement ce qu'on consomme, au fur et à mesure. Pour notre projet Veto-Care, le coût de démarrage est **zéro euro**. Vercel offre un hébergement gratuit avec déploiement automatique, et Supabase offre une base de données PostgreSQL gratuite avec authentification et stockage inclus. Ce modèle est idéal pour un projet étudiant ou une startup qui veut valider son idée sans risque financier.

### 2. Comment Vercel gère-t-il la scalabilité ?

Un data center physique local nécessite une infrastructure coûteuse : salles climatisées, serveurs en rack, onduleurs, équipes de maintenance 24h/24. Si le trafic augmente soudainement, il faut acheter de nouveaux serveurs, ce qui prend des semaines.

Vercel utilise une architecture **Serverless** et un réseau de distribution mondial (CDN). Concrètement, si Veto-Care reçoit 10 visiteurs ou 10 000 visiteurs en même temps, Vercel adapte automatiquement les ressources sans intervention humaine. Les fonctions s'exécutent à la demande et s'arrêtent quand elles ne sont plus utilisées. Il n'y a pas de serveur qui "tourne dans le vide". Cette scalabilité automatique est impossible à atteindre facilement avec un serveur physique local.

### 3. Données Structurées vs Non-Structurées dans Veto-Care

Dans notre application, les deux types de données coexistent :

**Données structurées** : Ce sont les données organisées dans les tables PostgreSQL de Supabase. La table `veterinaires` contient des colonnes précises (nom, prénom, spécialité). La table `rendez_vous` contient des champs définis (date, motif, statut, clés étrangères). Ces données sont facilement interrogeables avec des requêtes SQL.

**Données non-structurées** : Ce sont les carnets de santé des animaux uploadés par les maîtres. Ces fichiers (PDF ou images) n'ont pas de structure fixe — chaque carnet est différent, avec des formats variés. Ils sont stockés dans **Supabase Storage** (bucket `carnets-sante`) et référencés par une URL dans la table `rendez_vous`. Ce type de données ne peut pas être stocké directement dans une colonne SQL classique.

## 🛠️ Stack Technologique
- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend/BaaS** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Vercel (CI/CD automatique)
- **Vibe Coding** : Lovable.dev + Cursor AI

## 🔐 Identifiants de Test
- **Email** : test@veto-care.com
- **Mot de passe** : Test1234!
