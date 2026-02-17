const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

const files = [
  'aménagement__banikoara2.jpg',
  'Projet_bloc2_banikoara.jpg',
  'station_ponpage_banikoara2.jpg',
  'aménagement__banikoara1.jpg'
];

const srcDir = path.join(process.cwd(), 'image');
const backupDir = path.join(srcDir, 'rotation_left_backup');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

(async () => {
  for (const f of files) {
    try {
      const src = path.join(srcDir, f);
      if (!fs.existsSync(src)) {
        console.log(`MISSING: ${f}`);
        continue;
      }
      const bak = path.join(backupDir, f);
      fs.copyFileSync(src, bak);
      await sharp(src).rotate(270).toFile(src + '.tmp');
      fs.renameSync(src + '.tmp', src);
      const hBak = crypto.createHash('sha1').update(fs.readFileSync(bak)).digest('hex');
      const hNew = crypto.createHash('sha1').update(fs.readFileSync(src)).digest('hex');
      console.log(`Rotated left: ${f} — backupSHA: ${hBak} — newSHA: ${hNew}`);
    } catch (err) {
      console.error(`Error processing ${f}:`, err.message);
    }
  }
})();
