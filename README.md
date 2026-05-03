# 🐾 Veto-Care — Extranet Clinique Vétérinaire

## 👥 Groupe
- HOCINE Imen
- IAOUDARENE Lina
- MADI Abderrahmane
- MEZIANI Amir Mouataz

## 🔗 Liens
- **Application** : https://veto-care-mon-dossier.vercel.app
- **GitHub** : https://github.com/ihocine-sketch/veto-care-mon-dossier

---

## 🗺️ Mapping du Thème

| Élément | Correspondance dans Veto-Care |
|---------|-------------------------------|
| **Table A** | Maîtres (propriétaires d'animaux) gérés via Supabase Auth |
| **Table B** | Vétérinaires (nom, prénom, spécialité) |
| **Table C** | Rendez-vous (relie un maître à un vétérinaire, avec date et statut) |
| **Fichier** | Carnet de santé de l'animal (PDF ou image) via Supabase Storage |

---

## 🏗️ Analyse d'Architecture Cloud 

### 1. Pourquoi Vercel + Supabase est financièrement plus logique ? (CAPEX vs OPEX)

Lorsqu'une entreprise ou un étudiant souhaite lancer une application web, deux modèles économiques s'offrent à lui. Le premier modèle est basé sur le **CAPEX** (Capital Expenditure), c'est-à-dire les dépenses en capital. Dans ce modèle classique, il faut acheter des serveurs physiques, payer une salle dans un data center, installer les systèmes d'exploitation, configurer les bases de données, acheter des licences logicielles, et embaucher des administrateurs système. Tout cela représente un investissement initial très élevé, parfois des dizaines de milliers d'euros, avant même d'avoir le premier utilisateur.

Le deuxième modèle est basé sur l'**OPEX** (Operational Expenditure), c'est-à-dire les dépenses opérationnelles. C'est exactement ce que proposent Vercel et Supabase. Au lieu de payer tout d'avance, on paye uniquement ce qu'on consomme, au fur et à mesure. Pour notre projet Veto-Care, le coût de démarrage est **zéro euro**. Vercel offre un hébergement gratuit avec déploiement automatique, et Supabase offre une base de données PostgreSQL gratuite avec authentification et stockage de fichiers inclus. Si demain notre application grandit et attire des milliers d'utilisateurs, on peut passer à un plan payant progressivement, sans changer d'architecture. Ce modèle OPEX est donc beaucoup plus adapté pour un projet étudiant, une startup, ou tout projet qui veut valider son idée avant d'investir massivement.

### 2. Comment Vercel gère-t-il la scalabilité par rapport à un Data Center physique ?

Un data center physique local est une infrastructure très complexe et coûteuse à maintenir. Il nécessite des salles climatisées en permanence pour éviter la surchauffe des serveurs, des serveurs en rack avec des alimentations redondantes, des onduleurs pour éviter les coupures de courant, des connexions réseau multiples pour garantir la disponibilité, et des équipes techniques disponibles 24h/24 et 7j/7. Si le trafic augmente soudainement, il faut commander de nouveaux serveurs, les installer et les configurer, ce qui peut prendre plusieurs semaines.

Vercel utilise une architecture **Serverless** basée sur un réseau de distribution mondial appelé CDN (Content Delivery Network). Concrètement, si Veto-Care reçoit 10 visiteurs ou 100 000 visiteurs en même temps, Vercel adapte automatiquement les ressources disponibles sans aucune intervention humaine. Les fonctions s'exécutent uniquement à la demande et s'arrêtent automatiquement quand elles ne sont plus utilisées, ce qui évite tout gaspillage de ressources. De plus, le contenu est servi depuis le serveur le plus proche de l'utilisateur géographiquement, ce qui rend l'application rapide partout dans le monde. Cette scalabilité automatique et instantanée est pratiquement impossible à atteindre avec un serveur physique local sans un investissement énorme.

### 3. Données Structurées vs Non-Structurées dans Veto-Care

Dans notre application Veto-Care, les deux types de données coexistent et se complètent.

Les **données structurées** sont organisées dans les tables PostgreSQL de Supabase. La table `veterinaires` contient des colonnes bien définies : id, nom, prénom, spécialité, et date de création. La table `rendez_vous` contient des champs précis : id, maitre_id (clé étrangère vers auth.users), veterinaire_id (clé étrangère vers veterinaires), nom_animal, espece, date_rdv, motif, statut, et carnet_sante_url. Ces données sont facilement interrogeables avec des requêtes SQL, filtrables, et triables. Le Row Level Security (RLS) de Supabase s'applique directement sur ces tables pour garantir que chaque maître ne voit que ses propres rendez-vous.

Les **données non-structurées** sont les carnets de santé des animaux uploadés par les maîtres. Ces fichiers peuvent être des PDFs ou des images, avec des formats, des tailles et des contenus complètement différents d'un animal à l'autre. Ils n'ont pas de structure fixe et ne peuvent pas être stockés dans une colonne SQL classique. C'est pourquoi nous utilisons **Supabase Storage** avec le bucket `carnets-sante` pour stocker ces fichiers. Dans la base de données, nous sauvegardons uniquement l'URL publique du fichier dans la colonne `carnet_sante_url` de la table `rendez_vous`, ce qui permet de lier la donnée non-structurée à la donnée structurée.

---

## 🛠️ Stack Technologique
- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend/BaaS** : Supabase (PostgreSQL + Auth + Storage + RLS)
- **Déploiement** : Vercel (CI/CD automatique)
- **Vibe Coding** : Lovable.dev + Cursor AI

## 🔐 Identifiants de Test
- **Email** : test@veto-care.com
- **Mot de passe** : Test1234!
