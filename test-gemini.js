const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No API key found in .env');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite', 'gemini-pro'];
  
  for (const modelName of models) {
    console.log(`\nTesting ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi, say hello if you can read this.');
      console.log(`SUCCESS [${modelName}]:`, result.response.text());
      return; // Return on first success
    } catch (e) {
      console.log(`FAILED [${modelName}]:`, e.status, e.statusText);
      if (e.errorDetails) {
         console.log(JSON.stringify(e.errorDetails, null, 2));
      }
    }
  }
}
test();
