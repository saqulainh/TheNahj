import { env } from "process";
import fs from "fs";

const apiKey = fs.readFileSync(".env.local", "utf8").match(/GEMINI_API_KEY=(.*)/)[1];

async function testModel(model) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hello" }] }],
        }),
      }
    );
    const text = await response.text();
    console.log(`[${model}] Status: ${response.status} Body: ${text.substring(0, 200)}`);
  } catch (e) {
    console.log(`[${model}] Error: ${e.message}`);
  }
}

async function run() {
  await testModel("gemini-1.5-pro");
  await testModel("gemini-1.5-flash");
  await testModel("gemini-2.0-flash");
  await testModel("gemini-2.0-flash-exp");
}
run();
