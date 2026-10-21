import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve(process.argv[2] || process.cwd());
const out = path.join(projectRoot,'project-docs/client-review/assets/fonts');
await fs.mkdir(out, { recursive: true });
// Project-specific choices stay with project deliverables, not in this skill.
// Each item: { family, stem, folder, weights }, where folder is the Google Fonts OFL folder.
const config = path.resolve(process.argv[3] || path.join(projectRoot,'project-docs/client-review/font-sources.json'));
const families = JSON.parse(await fs.readFile(config,'utf8'));
const records = [];
const rules = [];
for (const {family, stem, folder, weights} of families) {
  if(!/^[A-Za-z0-9 -]+$/.test(family) || !/^[A-Za-z0-9]+$/.test(stem) || !/^[a-z0-9]+$/.test(folder) || !/^[a-zA-Z0-9@;,.]+$/.test(weights)) throw new Error('Invalid font source definition');
  const source = `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:${weights}&display=swap`;
  const response = await fetch(source, { signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' } });
  if (!response.ok) throw new Error(`${family}: ${response.status}`);
  const css = await response.text();
  const faces = [...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(m => m[1]);
  if (!faces.length) throw new Error(`Latin font face missing for ${family}`);
  const files = new Map();
  for (let face of faces) {
    const url = face.match(/url\(([^)]+)\)/)[1];
    let name = files.get(url);
    if (!name) {
      name = `${stem}-${files.size + 1}.woff2`;
      const font = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (!font.ok) throw new Error(`${url}: ${font.status}`);
      await fs.writeFile(path.join(out, name), Buffer.from(await font.arrayBuffer()));
      files.set(url, name);
    }
    rules.push(face.replace(url, name));
  }
  const licenseUrl = `https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`;
  const license = await fetch(licenseUrl, { signal: AbortSignal.timeout(25000) });
  if (!license.ok) throw new Error(`Font license missing: ${family}`);
  await fs.writeFile(path.join(out, `${stem}-OFL.txt`), await license.text());
  records.push({ family, cssSource: source, licenseSource: licenseUrl, files: [...files.values()], downloadedAt: new Date().toISOString() });
}
await fs.writeFile(path.join(out, 'fonts.css'), rules.join('\n'));
await fs.writeFile(path.join(out, 'provenance.json'), JSON.stringify(records, null, 2));
console.log(`Saved ${families.length} locally hosted Google Font families and their OFL licenses.`);
