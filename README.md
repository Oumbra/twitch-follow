# ![](/src/assets/twitch-flat-32x32.png) Twitch Follow

Cette extension permet de d'alerter lorsqu'un streamer, qui fait partie de l'annuaire de l'extension, démarre un live sur Twitch. 
L'annuaire de l'extension est restreint aux streamers Twitch et n'est lié qu'au navigateur où est installé l'extension. 

## Fonctionnalités

- Recherche de streamer grâce aux API Twitch
- Gestion de l'annulaire local de streamer (ajout et suppression)
- Rejoindre la page Twitch d'un streamer de l'annuaire
- Import et export de l'annuaire local
- Réglage des paramètres de l'extension
- Mode sombre

> **Aucune données personnelles ne sont stockées et/ou transférées.**

## Présentation

![Présentation 1](/src/assets/presentation/presentation1.png)
![Présentation 2](/src/assets/presentation/presentation2.png)
![Présentation 3](/src/assets/presentation/presentation3.png)

# Developper Mode

Cette extension est développée avec le gestionnaire de dépendance NPM et utilise le framework Angular v8.

Tout le code source sur [GitHub](https://github.com/Oumbra/twitch-follow)

Voici les étapes nécessaire pour exécuter le code en local :
- Téléchargé l'archive du projet : https://github.com/Oumbra/twitch-follow/archive/refs/heads/master.zip
- Dézipper le zip
- Dans le répertoire dézippé, jouer la commande `npm install` pour récupérer toutes les dépendances
- Lancer le serveur avec la commande `ng serve`, le serveur démarre sur l'adresse `http://localhost:4200/`
