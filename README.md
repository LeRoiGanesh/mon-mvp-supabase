# Application de Gestion de Présence et de Tâches

Une application web moderne pour la gestion de présence et de tâches sur chantier, construite avec React, Supabase et Tailwind CSS.

## 🎯 Fonctionnalités

### Pour les Employés

- ✅ **Check-in avec photo** : Prise de photo obligatoire à l'arrivée
- 📋 **Gestion des tâches** : Visualisation et validation des tâches du jour
- 🏃 **Demande de départ** : Enregistrement du départ avec validation admin
- 💿 **Persistance des données** : L'état "en attente de validation" persiste même après un refresh

### Pour les Administrateurs

- 👥 **Suivi des présences** : Visualisation de tous les employés présents
- 📸 **Validation des photos** : Vérification des photos de présence
- 📋 **Gestion des tâches** : Création et validation des tâches
- ✅ **Validation des départs** : Approbation des demandes de départ
- 🔍 **Contrôle qualité** : Vérification que toutes les tâches sont terminées avant validation

## 🛠️ Technologies utilisées

- **React 19** avec hooks
- **Supabase** pour la base de données et l'authentification
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Vite** pour le build et le développement

## 🚀 Installation

1. Clonez le projet

```bash
git clone <votre-repo>
cd mon-mvp-supabase
```

2. Installez les dépendances

```bash
npm install
```

3. Configurez Supabase

   - Créez un projet Supabase
   - Exécutez le fichier `supabase_rls_policies.sql` pour créer les tables et politiques
   - Configurez votre fichier `src/lib/client.js` avec vos clés Supabase

4. Démarrez l'application

```bash
npm run dev
```

## 📚 Structure du projet

```
src/
├── components/           # Composants réutilisables
│   ├── CheckInPhoto.jsx     # Composant de check-in avec photo
│   ├── ListeTaches.jsx      # Affichage des tâches (admin)
│   ├── ValidationTaches.jsx # Validation des tâches (employé)
│   ├── TachesEmploye.jsx    # Affichage des tâches d'un employé (admin)
│   └── AjoutTacheModal.jsx  # Modal d'ajout de tâche
├── pages/               # Pages principales
│   ├── Login.jsx           # Page de connexion
│   ├── DashboardEmploye.jsx # Dashboard employé
│   └── DashboardAdmin.jsx   # Dashboard administrateur
├── lib/
│   └── client.js          # Configuration Supabase
└── App.jsx               # Composant racine avec routage
```

## 🗄️ Structure de base de données

### Tables principales

- `utilisateurs` - Informations des employés et administrateurs
- `presences` - Enregistrement des présences avec photos
- `taches` - Gestion des tâches assignées

### Buckets Supabase Storage

- `photos` - Stockage des photos de présence

## 🔐 Sécurité

- Authentification Supabase intégrée
- Politiques RLS (Row Level Security) configurées
- Séparation des rôles admin/employé
- Validation côté serveur pour toutes les opérations

## 🎨 Interface utilisateur

- Design responsive avec Tailwind CSS
- Interface intuitive et moderne
- Feedback visuel pour toutes les actions
- Affichage en temps réel des statuts

## 🔄 Workflow

1. **Employé se connecte** → Check-in avec photo
2. **Admin assigne des tâches** → Employé les voit instantanément
3. **Employé valide ses tâches** → Statut mis à jour en temps réel
4. **Employé demande le départ** → Statut "en attente de validation"
5. **Admin vérifie les tâches** → Valide ou refuse le départ

## 📝 Prochaines améliorations

- [ ] Notifications push pour les nouvelles tâches
- [ ] Export des données de présence
- [ ] Statistiques et rapports
- [ ] Interface mobile dédiée
- [ ] Géolocalisation pour le check-in

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
