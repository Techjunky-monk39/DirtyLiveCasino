// pitbossGPT.js
// Backend module for Pit Boss GPT integration
// Handles admin queries, SQL generation, and log analysis via OpenAI API

const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function askPitBoss(prompt, context = '') {
  const messages = [
    { role: 'system', content: 'You are a helpful casino admin assistant (Pit Boss GPT). Answer clearly and concisely.' },
    { role: 'user', content: context ? `${context}\n${prompt}` : prompt }
  ];
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-4o',
      messages,
      max_tokens: 512
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data.choices[0].message.content;
}

async function generateSQL(nlQuery) {
  const prompt = `Generate a safe, parameterized PostgreSQL query for: ${nlQuery}`;
  return askPitBoss(prompt);
}

async function summarizeLogs(logData) {
  const prompt = `Analyze these logs and summarize any issues or anomalies.\nLogs:\n${logData}`;
  return askPitBoss(prompt);
}

module.exports = {
  askPitBoss,
  generateSQL,
  summarizeLogs
};
