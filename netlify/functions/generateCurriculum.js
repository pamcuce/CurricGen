// Located at: netlify/functions/generateCurriculum.js

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not configured.");
    }
     if (!prompt) {
      throw new Error("No prompt was provided.");
    }

    // Using the more powerful and knowledgeable Pro model
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        topK: 40,
      }
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.json();
        console.error("Google API Error:", errorBody);
        return { statusCode: apiResponse.status, body: JSON.stringify({ error: "Failed to get a response from the AI model." }) };
    }

    const result = await apiResponse.json();

    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
        const curriculumText = result.candidates[0].content.parts[0].text;
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ curriculum: curriculumText })
        };
    } else {
        // Handle cases where the model returns no candidates (e.g., safety settings)
        console.error("Invalid response structure from API:", result);
        return { statusCode: 500, body: JSON.stringify({ error: "Received an invalid or empty response from the AI model." }) };
    }

  } catch (error) {
    console.error("Serverless function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
