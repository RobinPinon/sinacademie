# Structure du Projet SinAcademie

## Organisation des dossiers

### 📁 `components/`
Ce dossier contient tous les composants réutilisables de l'application.

**Fichiers actuels :**
- `Button.tsx` - Composant bouton réutilisable avec variantes
- `index.ts` - Fichier d'export pour faciliter les imports

**Convention de nommage :**
- Utilisez PascalCase pour les noms de composants (ex: `UserProfile.tsx`)
- Créez un dossier séparé pour les composants complexes avec plusieurs fichiers

### 📁 `pages/`
Ce dossier contient toutes les pages de l'application.

**Fichiers actuels :**
- `Home.tsx` - Page d'accueil de l'application
- `index.ts` - Fichier d'export pour faciliter les imports

**Convention de nommage :**
- Utilisez PascalCase pour les noms de pages (ex: `CourseList.tsx`)
- Créez un dossier séparé pour les pages complexes avec plusieurs composants

## Utilisation

### Import des composants
```tsx
import { Button } from '../components';
// ou
import Button from '../components/Button';
```

### Import des pages
```tsx
import { Home } from '../pages';
// ou
import Home from '../pages/Home';
```

## Bonnes pratiques

1. **Composants réutilisables** : Placez-les dans `components/`
2. **Pages spécifiques** : Placez-les dans `pages/`
3. **Logique métier** : Créez un dossier `services/` si nécessaire
4. **Types et interfaces** : Créez un dossier `types/` si nécessaire
5. **Utilitaires** : Créez un dossier `utils/` si nécessaire
