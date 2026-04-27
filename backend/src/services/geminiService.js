const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function estimateWithGemini(items, baseEstimate) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Returning base estimate.');
    return { estimatedPrice: baseEstimate, reasoning: 'API key not configured' };
  }

  const prompt = `You are an expert e-waste appraiser. I have an e-waste cart with the following items:
${JSON.stringify(items, null, 2)}

The base rule-based estimate for this cart is ₹${baseEstimate}.
Please consider the condition, year of manufacturing, and standard scrap values for e-waste to estimate a fair final price. 
Respond ONLY with a valid JSON object containing:
{
  "estimatedPrice": <number>,
  "reasoning": "<brief string explaining the estimate based on condition/age>"
}
Do not include any markdown formatting, backticks, or extra text. Just the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return {
      estimatedPrice: parsed.estimatedPrice || baseEstimate,
      reasoning: parsed.reasoning || 'Standard estimation'
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return { estimatedPrice: baseEstimate, reasoning: 'Fallback to base estimation due to API error' };
  }
}

module.exports = {
  estimateWithGemini
};
