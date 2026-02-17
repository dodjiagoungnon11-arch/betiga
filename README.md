<<<<<<< HEAD
# BETIGA SARL - Site Web

## 📋 Description
Site web professionnel de BETIGA SARL - Bureau d'Études Techniques spécialisé en géomatique, topographie, SIG et télédétection.

## 🚀 Déploiement

### Sur Netlify

1. **Connecter le repository GitHub à Netlify** :
   - Allez sur [netlify.com](https://www.netlify.com)
   - Cliquez sur "New site from Git"
   - Sélectionnez GitHub et autorisez l'accès
   - Sélectionnez ce repository
   - Cliquez sur "Deploy"

2. **Configuration du formulaire de contact** :
   - Le formulaire utilise **FormSubmit.co** (gratuit et sans configuration)
   - Les messages sont envoyés à : `sbetiga@gmail.com`
   - Les pièces jointes fonctionnent directement

3. **Le site sera en ligne à** : `https://[votre-nom].netlify.app`

### Optional : Domaine personnalisé

- Achetez un domaine (ex: betiga.bj)
- Dans Netlify : Site settings → Domain management → Add custom domain
- Suivez les instructions DNS

## 📁 Structure du projet

```
index.html             # Page principale
send.php               # Non utilisé sur Netlify
css/                   # Feuilles de style
js/                    # JavaScript
image/                 # Images et photos
netlify.toml           # Configuration Netlify
```

## 🔧 Développement local

- Ouvrez `index.html` dans votre navigateur
- Les modifications sont instantanées (F5 pour rafraîchir)
- Testez le formulaire (FormSubmit enverra un vrai email)

## 🖼️ Optimiser les images (réduire la taille pour un chargement rapide)

Un script Node.js est fourni pour sauvegarder les originaux et compresser les images.

1. Installez Node.js (si nécessaire) : https://nodejs.org/
2. Dans le dossier du projet, installez les dépendances :

```bash
npm install
```

3. Lancez l'optimisation :

```bash
npm run optimize-images
```

Le script sauvegarde d'abord les images originales dans `image/originals_backup/` puis compresse et remplace les fichiers originaux par des versions optimisées. Vérifiez les images et committez les changements si tout est OK.

## 📧 Contact & Assistance

Email: sbetiga@gmail.com
=======
# betiga
>>>>>>> c86b9781d0d135011ff885b924e66dcef5e75e05
