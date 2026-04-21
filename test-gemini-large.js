const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = [
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite-001',
    'gemini-3-pro-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest'
  ];
  const basePrompt = "Generate a JSON response based on this prompt context: " + "context word ".repeat(1500);
  
  for (const modelName of models) {
    console.log(`\nTesting ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(basePrompt);
      console.log(`SUCCESS [${modelName}]:`, result.response.text().substring(0, 50));
    } catch (e) {
      console.log(`FAILED [${modelName}]:`, e.status, e.statusText);
    }
  }
}
test();
