const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(process.cwd(), 'image');
const backupDir = path.join(srcDir, 'size_backup');
const skipDirs = ['originals_backup','orientation_backup','rotation_fix_backup','rotation_left_backup','size_backup'];
const exts = ['.jpg','.jpeg','.png','.webp'];

if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

function getFiles(dir) {
  const res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.includes(entry.name)) continue;
      res.push(...getFiles(full));
    } else {
      if (exts.includes(path.extname(entry.name).toLowerCase())) res.push(full);
    }
  }
  return res;
}

(async () => {
  const files = getFiles(srcDir);
  console.log('Images trouvées :', files.length);
  let beforeTotal = 0;
  let afterTotal = 0;
  for (const f of files) {
    try {
      const rel = path.relative(srcDir, f);
      const backupPath = path.join(backupDir, rel);
      const backupDirPath = path.dirname(backupPath);
      if (!fs.existsSync(backupDirPath)) fs.mkdirSync(backupDirPath, { recursive: true });
      if (!fs.existsSync(backupPath)) fs.copyFileSync(f, backupPath);
      const statBefore = fs.statSync(f);
      beforeTotal += statBefore.size;

      const ext = path.extname(f).toLowerCase();
      const img = sharp(f);
      const meta = await img.metadata();

      // resize to max width 1200, keep aspect ratio, do not enlarge
      const width = meta.width && meta.width > 1200 ? 1200 : meta.width;
      let pipeline = img.resize({ width, withoutEnlargement: true });

      // compress depending on format, preserve metadata to keep orientation
      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 70, mozjpeg: true }).withMetadata();
      } else if (ext === '.png') {
        pipeline = pipeline.png({ compressionLevel: 8 }).withMetadata();
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 75 }).withMetadata();
      }

      await pipeline.toFile(f + '.tmp');
      fs.renameSync(f + '.tmp', f);
      const statAfter = fs.statSync(f);
      afterTotal += statAfter.size;
      const saved = ((statBefore.size - statAfter.size) / statBefore.size * 100).toFixed(1);
      console.log(`${rel} — ${Math.round(statBefore.size/1024)}KB → ${Math.round(statAfter.size/1024)}KB (${saved}% saved)`);
    } catch (err) {
      console.error('Error:', f, err.message);
    }
  }

  console.log('\nTotal avant:', Math.round(beforeTotal/1024), 'KB');
  console.log('Total après:', Math.round(afterTotal/1024), 'KB');
  console.log('Réduction totale:', Math.round((beforeTotal-afterTotal)/1024), 'KB');
})();
