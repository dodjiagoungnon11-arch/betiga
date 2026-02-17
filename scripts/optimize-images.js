const fg = require('fast-glob');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

(async () => {
  const baseDir = path.join(__dirname, '..', 'image');
  const backupDir = path.join(baseDir, 'originals_backup');

  console.log('Recherche des images dans :', baseDir);

  // Use glob patterns relative to baseDir (forward slashes) to avoid Windows backslash issues
  const patterns = ['**/*.{jpg,jpeg,png,JPG,JPEG,PNG,gif,webp,svg}'];

  const entries = await fg(patterns, { cwd: baseDir, dot: false, onlyFiles: true, absolute: true, ignore: ['originals_backup/**'] });

  if (entries.length === 0) {
    console.log('Aucune image trouvée.');
    return;
  }

  console.log(`Images trouvées : ${entries.length}`);

  for (const file of entries) {
    try {
      const rel = path.relative(baseDir, file);
      const destBackup = path.join(backupDir, rel);
      const destBackupDir = path.dirname(destBackup);

      await fs.mkdir(destBackupDir, { recursive: true });
      await fs.copyFile(file, destBackup);

      const ext = path.extname(file).toLowerCase();
      const img = sharp(file, { failOnError: false });
      const metadata = await img.metadata();

      // Resize only if width > 1600
      // Ensure we respect EXIF orientation
      let pipeline = img.rotate();
      if (metadata.width && metadata.width > 1600) pipeline = pipeline.resize(1600);

      // Apply format-specific compression and overwrite original
      if (ext === '.jpg' || ext === '.jpeg') {
        await pipeline.jpeg({ quality: 75 }).toFile(file + '.opt');
      } else if (ext === '.png') {
        await pipeline.png({ compressionLevel: 9 }).toFile(file + '.opt');
      } else if (ext === '.webp') {
        await pipeline.webp({ quality: 75 }).toFile(file + '.opt');
      } else if (ext === '.gif') {
        // convert gif to webp for better compression
        await pipeline.webp({ quality: 75 }).toFile(file + '.opt');
      } else if (ext === '.svg') {
        // SVG already vector — skip optimization here
        await fs.unlink(file + '.opt').catch(()=>{});
        console.log(`SKIP (svg): ${rel}`);
        continue;
      } else {
        console.log(`SKIP (non supporté): ${rel}`);
        continue;
      }

      // Replace original with optimized (atomic rename)
      await fs.rename(file + '.opt', file);

      const before = (await fs.stat(destBackup)).size;
      const after = (await fs.stat(file)).size;
      const saved = before - after;
      const savedPct = ((saved / before) * 100).toFixed(1);

      console.log(`Optimized: ${rel} — ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB (${savedPct}% saved)`);
    } catch (err) {
      console.error('Erreur sur', file, err.message);
    }
  }

  console.log('Optimisation terminée. Sauvegardes dans :', backupDir);
})();
