const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
const key = match ? match[1] : '';
console.log('Using API key:', key.substring(0, 8) + '...');

async function main() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
  const data = await res.json();
  if (data.models) {
    console.log('\n--- ALL AVAILABLE EMBEDDING MODELS ---');
    const embedModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent'));
    embedModels.forEach(m => {
      console.log('Model:', m.name);
      console.log('  Display Name:', m.displayName);
      console.log('  Description:', m.description);
      console.log('  Methods:', m.supportedGenerationMethods.join(', '));
    });
  } else {
    console.log('Error listing models:', JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
