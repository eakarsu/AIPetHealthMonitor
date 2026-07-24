const fetch = require('node-fetch');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

async function askAI(prompt, systemPrompt = 'You are a veterinary AI assistant. Provide helpful, accurate pet health advice. Always recommend consulting a real veterinarian for serious concerns.') {
  try {
    if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured');
    const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
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
    if (!response.ok || data.error) throw new Error(data.error?.message || `OpenRouter returned HTTP ${response.status}`);
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('OpenRouter returned an empty response');
    return {
      content,
      model: data.model,
      usage: data.usage
    };
  } catch (err) {
    console.error('AI service error:', err.message);
    return { error: err.message };
  }
}

module.exports = { askAI };
