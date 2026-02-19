const fg = require('fast-glob');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

(async ()=>{
  const baseDir = path.join(__dirname, '..', 'image');
  const outDir = path.join(baseDir, 'responsive');
  await fs.mkdir(outDir, { recursive: true });

  const patterns = ['**/*.{jpg,jpeg,png,JPG,JPEG,PNG}'];
  const files = await fg(patterns, { cwd: baseDir, absolute: true, ignore: ['originals_backup/**','responsive/**'] });
  if(!files.length){ console.log('Aucune image trouvée pour générer des variantes.'); return; }

  const widths = [400,800,1200,1600];
  const manifest = {};

  for(const file of files){
    try{
      const rel = path.relative(baseDir, file).replace(/\\/g, '/');
      const name = path.basename(rel, path.extname(rel));
      const safeName = name.replace(/[^a-z0-9-_]/gi, '_');
      const outPrefix = path.join(outDir, safeName);

      const img = sharp(file, { failOnError: false });
      const meta = await img.metadata();
      const available = [];

      for(const w of widths){
        if(meta.width && meta.width < w) continue;
        const outFile = `${outPrefix}-w${w}.webp`;
        await img.resize({ width: w }).webp({ quality: 75 }).toFile(outFile);
        available.push({ file: path.relative(path.join(__dirname,'..'), outFile).replace(/\\/g, '/'), width: w });
      }

      // Always include a fallback at original size (converted to webp)
      const originalWebp = `${outPrefix}-orig.webp`;
      await img.webp({ quality: 80 }).toFile(originalWebp);
      available.push({ file: path.relative(path.join(__dirname,'..'), originalWebp).replace(/\\/g, '/'), width: meta.width || 0 });

      // sort by width asc
      available.sort((a,b)=>a.width-b.width);
      const srcset = available.map(a=>`${a.file} ${a.width}w`).join(', ');
      manifest[rel] = { src: rel, srcset, responsive: available };
      console.log('Generated:', rel, 'variants:', available.length);
    }catch(err){ console.error('Error processing', file, err.message); }
  }

  await fs.writeFile(path.join(__dirname, '..', 'image', 'responsive-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Responsive manifest written to image/responsive-manifest.json');
})();
