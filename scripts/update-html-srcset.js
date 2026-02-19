const fg = require('fast-glob');
const path = require('path');
const fs = require('fs').promises;

(async ()=>{
  const workspace = path.join(__dirname, '..');
  const manifestPath = path.join(workspace, 'image', 'responsive-manifest.json');
  try{
    const manifestRaw = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw);

    const htmlFiles = await fg(['**/*.html'], { cwd: workspace, absolute: true, ignore: ['node_modules/**','image/**','scripts/**'] });
    for(const file of htmlFiles){
      let content = await fs.readFile(file, 'utf8');
      let changed = false;
      for(const [rel, info] of Object.entries(manifest)){
        const htmlSrc = rel.replace(/\//g, '/');
        // match src="...rel..." occurrences
        const regex = new RegExp('(<img[^>]+src=["\'])(?:\.\./)?'+escapeRegExp(htmlSrc)+'(["\'][^>]*>)','gi');
        content = content.replace(regex, (m, p1, p2)=>{
          // if already has srcset, skip
          if(/srcset=/i.test(m)) return m;
          changed = true;
          const srcset = info.srcset;
          // insert loading lazy and srcset
          return `${p1}${htmlSrc}" srcset="${srcset}" sizes="(max-width:900px) 100vw, 900px" loading="lazy" ${p2}`;
        });
      }
      if(changed){
        // backup original
        await fs.copyFile(file, file + '.bak');
        await fs.writeFile(file, content, 'utf8');
        console.log('Updated:', path.relative(workspace, file));
      }
    }

    console.log('Done applying srcset to HTML files. Backups with .bak created.');
  }catch(err){
    console.error('Error:', err.message);
  }

  function escapeRegExp(string){ return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
})();
