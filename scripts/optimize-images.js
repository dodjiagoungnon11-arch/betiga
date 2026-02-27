const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const imagesToOptimize = [
  'image/lotisse.jpg',
  'image/Carte.jpg',
  'image/1.jpg',
  'image/2.jpg',
  "image/1'.jpg",
  "image/2'.jpg",
  "image/1''.jpg",
  "image/2''.jpg"
];

const targetDir = 'image';

// On va essayer d'utiliser Jimp via npx si possible, ou juste un script simple
// Mais comme je ne peux pas garantir l'installation, je vais essayer d'utiliser un outil node natif si possible
// En fait, sans bibliothèque externe, compresser un JPG est difficile en Node pur.
// Je vais essayer d'utiliser 'sharp' ou 'jimp' via npx de manière programmatique.

console.log("Démarrage de l'optimisation des images...");

try {
  for (const imgPath of imagesToOptimize) {
    const fullPath = path.join(process.cwd(), imgPath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`Traitement de ${imgPath} (${sizeMB} MB)...`);

      // On essaie d'utiliser npx avec sharp-cli pour redimensionner
      // --width 1920 --quality 80 --output
      try {
        // escape path for windows
        const escapedPath = `"${fullPath}"`;
        execSync(`npx -y sharp-cli --input ${escapedPath} --output ${escapedPath} --width 1920 --quality 80`, { stdio: 'inherit' });
        const newStats = fs.statSync(fullPath);
        const newSizeMB = (newStats.size / (1024 * 1024)).toFixed(2);
        console.log(`Optimisé : ${newSizeMB} MB`);
      } catch (err) {
        console.error(`Échec de l'optimisation via sharp pour ${imgPath}. Tentative via jimp...`);
        // Tentative avec jimp si sharp échoue
        try {
          // execSync(`npx -y jimp ${escapedPath} -w 1920 -q 80 -o ${escapedPath}`, { stdio: 'inherit' });
        } catch (jimpErr) {
          console.error(`Toutes les tentatives ont échoué pour ${imgPath}`);
        }
      }
    }
  }
} catch (globalErr) {
  console.error("Erreur globale lors de l'optimisation :", globalErr);
}
