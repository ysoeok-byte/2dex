# FreeDexAn

Catalogue web pour rechercher des animés, films, webtoons et scans, avec fiches de saisons, versions et épisodes, plus un espace API réservé aux comptes connectés.

## Lancement

- `npm run dev` : serveur de développement et aperçu web sur le port 5000.
- `npm run build` : compilation du site.
- `npm start` : serveur de production, après compilation.

## Fonctionnalités

- Catalogue et recherche par titre et type.
- Fiches détaillées avec saisons, versions (dont VF/VOSTFR), épisodes et chapitres.
- Lecteur intégré de pages d’images lorsque l’œuvre fournit des pages dans ses données.
- Inscription/connexion stockées dans PostgreSQL; les mots de passe sont hachés et les sessions sont en cookie HTTP-only.
- Espace API réservé aux comptes; clés individuelles, révocables et à portée lecture/écriture.
- Les requêtes vers `/api/v1/*` nécessitent une clé API valide.

## Données et configuration

- La base PostgreSQL Replit est utilisée pour les comptes, sessions, clés API et œuvres importées.
- Les variables Discord de l’ancien projet ne sont plus utilisées.
- La source Anime-Sama est limitée aux URL HTTPS de son domaine et le catalogue se met en cache côté serveur.
