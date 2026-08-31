const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
const key = match ? match[1] : '';

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text: 'Patience is to faith what the head is to the body' }] },
      outputDimensionality: 768
    })
  });
  const data = await res.json();
  if (data.embedding && data.embedding.values) {
    console.log(`SUCCESS! Vector length: ${data.embedding.values.length}`);
    console.log('Values slice:', data.embedding.values.slice(0, 5));
  } else {
    console.log('FAILED:', JSON.stringify(data, null, 2));
  }
}
test();
