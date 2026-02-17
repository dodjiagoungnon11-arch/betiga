const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

(async () => {
  const baseDir = path.join(__dirname, '..', 'image');
  const backupDir = path.join(baseDir, 'orientation_backup');
  await fs.mkdir(backupDir, { recursive: true });

  // Files likely corresponding to the projects you listed
  const files = [
    'aménagement__banikoara1.jpg',
    'aménagement__banikoara2.jpg',
    'Projet_bloc1_banikoara.jpg',
    'Projet_bloc2_banikoara.jpg',
    'station_ponpage_banikoara1.jpg',
    'station_ponpage_banikoara2.jpg',
    'topographie.jpg',
    'Cartographie.jpg',
    'Equipe.jpeg'
  ];

  for (const f of files) {
    const src = path.join(baseDir, f);
    try {
      await fs.access(src);
    } catch (e) {
      console.log('Not found, skipping:', f);
      continue;
    }

    const bakPath = path.join(backupDir, f);
    await fs.mkdir(path.dirname(bakPath), { recursive: true });
    await fs.copyFile(src, bakPath);

    try {
      // rotate 180 degrees to correct upside-down images
      await sharp(src).rotate(180).toFile(src + '.rot');
      await fs.rename(src + '.rot', src);
      console.log('Rotated:', f);
    } catch (err) {
      console.error('Error rotating', f, err.message);
    }
  }

  console.log('Orientation fixes complete. Backups in:', backupDir);
})();
