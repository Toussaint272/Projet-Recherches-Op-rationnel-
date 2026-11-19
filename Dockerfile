# Étape 1 : Compilation de l'application React avec Node.js
FROM node:22-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances et installer
COPY package*.json ./
RUN npm ci

# Copier le reste du code source et compiler pour la production
COPY . .
RUN npm run build

# Étape 2 : Servir les fichiers compilés avec Nginx
FROM nginx:alpine

# Copier le dossier dist généré à l'étape précédente vers Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80 du conteneur
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]