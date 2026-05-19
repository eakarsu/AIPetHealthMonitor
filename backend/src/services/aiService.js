const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function askAI(prompt, systemPrompt = 'You are a veterinary AI assistant. Provide helpful, accurate pet health advice. Always recommend consulting a real veterinarian for serious concerns.') {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Pet Health Monitor'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error('OpenRouter error:', data.error);
      return { error: data.error.message || 'AI service error' };
    }
    return {
      content: data.choices?.[0]?.message?.content || 'No response from AI',
      model: data.model,
      usage: data.usage
    };
  } catch (err) {
    console.error('AI Service error:', err);
    return { error: 'Failed to connect to AI service' };
  }
}

module.exports = { askAI };
