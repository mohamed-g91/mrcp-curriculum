// Rasterise the authored SVGs with Sharp. No browser or network is used.
// node render-vector.cjs <absolute path to installed sharp package> [asset-directory]
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.argv[2] || 'sharp');
const dir = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, 'open-knowledge-vector');

(async () => {
  for (const filename of fs.readdirSync(dir).filter(n => n.endsWith('.svg'))) {
    const output = path.join(dir, filename.replace(/\.svg$/, '.png'));
    await sharp(path.join(dir, filename)).png().toFile(output);
  }
  for (const size of [16, 32, 64, 180, 512, 1024]) {
    await sharp(path.join(dir, 'icon.svg'), { density: 384 }).resize(size, size).png()
      .toFile(path.join(dir, `icon-${size}.png`));
  }
  await sharp(path.join(dir, 'avatar.svg'), { density: 384 }).resize(800, 800).png()
    .toFile(path.join(dir, 'youtube-800.png'));
  console.log(`Rendered SVG previews, icon sizes and 800 px avatar in ${dir}`);
})().catch(error => { console.error(error); process.exitCode = 1; });
