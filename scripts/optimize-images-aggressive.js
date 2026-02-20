const fg = require('fast-glob');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

(async () => {
  const baseDir = path.join(__dirname, '..', 'image');
  const backupDir = path.join(baseDir, 'originals_backup');

  console.log('🖼️  Optimisation AGRESSIF des images — réduction maximale sans perte de sens\n');
  console.log('📁 Répertoire source :', baseDir);

  // Use glob patterns relative to baseDir (forward slashes) to avoid Windows backslash issues
  const patterns = ['**/*.{jpg,jpeg,png,JPG,JPEG,PNG,gif,webp,svg}'];

  const entries = await fg(patterns, { cwd: baseDir, dot: false, onlyFiles: true, absolute: true, ignore: ['originals_backup/**', 'responsive/**'] });

  if (entries.length === 0) {
    console.log('❌ Aucune image trouvée.');
    return;
  }

  console.log(`✅ Images trouvées : ${entries.length}\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  const results = [];

  for (const file of entries) {
    try {
      const rel = path.relative(baseDir, file);
      const destBackup = path.join(backupDir, rel);
      const destBackupDir = path.dirname(destBackup);

      // Backup original if not already backed up
      const backupExists = await fs.stat(destBackup).catch(() => null);
      if (!backupExists) {
        await fs.mkdir(destBackupDir, { recursive: true });
        await fs.copyFile(file, destBackup);
      }

      const ext = path.extname(file).toLowerCase();
      const img = sharp(file, { failOnError: false });
      const metadata = await img.metadata();

      // Resize only if width > 1200 (more aggressive than before)
      // Ensure we respect EXIF orientation
      let pipeline = img.rotate();
      let resized = false;
      if (metadata.width && metadata.width > 1200) {
        pipeline = pipeline.resize(1200, { withoutEnlargement: true });
        resized = true;
      }

      // Apply format-specific AGGRESSIVE compression and overwrite original
      if (ext === '.jpg' || ext === '.jpeg') {
        // quality 65 = more aggressive, progressive = better for web
        await pipeline.jpeg({ quality: 65, progressive: true, mozjpeg: true }).toFile(file + '.opt');
      } else if (ext === '.png') {
        // Compression level 9 + adaptive filtering
        await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(file + '.opt');
      } else if (ext === '.webp') {
        // quality 65 for webp
        await pipeline.webp({ quality: 65 }).toFile(file + '.opt');
      } else if (ext === '.gif') {
        // convert gif to webp for better compression
        await pipeline.webp({ quality: 65 }).toFile(file + '.opt');
      } else if (ext === '.svg') {
        // SVG already vector — skip optimization here
        await fs.unlink(file + '.opt').catch(() => {});
        continue;
      } else {
        continue;
      }

      // Replace original with optimized (atomic rename)
      await fs.rename(file + '.opt', file);

      const before = backupExists ? (await fs.stat(destBackup)).size : 0;
      const after = (await fs.stat(file)).size;
      const saved = before > 0 ? before - after : 0;
      const savedPct = before > 0 ? ((saved / before) * 100).toFixed(1) : 0;

      totalBefore += before;
      totalAfter += after;

      const beforeKB = Math.round(before / 1024);
      const afterKB = Math.round(after / 1024);
      const resizeStatus = resized ? ' (redimensionné)' : '';

      console.log(`✓ ${rel}\n  ${beforeKB}KB → ${afterKB}KB (-${savedPct}%)${resizeStatus}`);

      results.push({ file: rel, before, after, pct: savedPct });
    } catch (err) {
      console.error(`❌ Erreur sur ${file} :`, err.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 RÉSUMÉ TOTAL :`);
  console.log(`   Avant : ${Math.round(totalBefore / (1024 * 1024))}MB`);
  console.log(`   Après : ${Math.round(totalAfter / (1024 * 1024))}MB`);
  console.log(`   Économie : ${Math.round((totalBefore - totalAfter) / (1024 * 1024))}MB (${totalBefore > 0 ? ((( totalBefore - totalAfter) / totalBefore) * 100).toFixed(1) : 0}%)`);
  console.log('='.repeat(70));
  console.log(`\n✅ Optimisation TERMINÉE. Sauvegardes dans : ${backupDir}`);
  console.log(`   Prêt à faire : git add -A && git commit -m "Optimiser images — redimensionner et compresser"\n`);
})();
