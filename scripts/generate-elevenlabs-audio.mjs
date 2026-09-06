import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const FORCE = process.env.FORCE_REGENERATE === 'true';

if (!API_KEY) throw new Error('Missing ELEVENLABS_API_KEY GitHub secret.');
if (!VOICE_ID) throw new Error('Missing ELEVENLABS_VOICE_ID GitHub secret.');

const prayers = [
  'morning','night','difficult','family','protection','gratitude','peace','work','restart','tomorrow',
  'cura','ansiedade','filhos','casamento','protecaoFilhos','madrugada','portas','livramento','perdao','fe'
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractPrayer(source, key) {
  const pattern = new RegExp(`${escapeRegExp(key)}\\s*:\\s*\\{[\\s\\S]*?text:'([\\s\\S]*?)'\\}`);
  const match = source.match(pattern);
  if (!match) throw new Error(`Prayer not found: ${key}`);
  return match[1].replace(/\\'/g, "'").trim();
}

const app = await fs.readFile('app.js', 'utf8');
const collection = await fs.readFile('colecao2.js', 'utf8');
const source = `${app}\n${collection}`;

const outputDir = path.join('audio', 'elevenlabs');
await fs.mkdir(outputDir, { recursive: true });

for (const key of prayers) {
  const output = path.join(outputDir, `${key}.mp3`);
  try {
    if (!FORCE) {
      await fs.access(output);
      console.log(`SKIP ${key}: already exists`);
      continue;
    }
  } catch {}

  const text = extractPrayer(source, key);
  console.log(`Generating ${key} (${text.length} chars)...`);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE_ID)}?output_format=mp3_44100_128`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2'
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs error for ${key}: HTTP ${response.status} ${detail}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(output, audio);
  console.log(`OK ${key}: ${audio.length} bytes`);

  await new Promise(resolve => setTimeout(resolve, 700));
}

console.log('ElevenLabs generation finished.');
