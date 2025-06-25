// Located at: netlify/functions/generateCurriculum.js
// This new version uses a Service Account for authentication.

// Import the GoogleAuth library, which will handle authentication
const { GoogleAuth } = require('google-auth-library');

exports.handler = async function (event, context) {
  // 1. Check for POST request
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Parse the incoming prompt
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      throw new Error("No prompt was provided.");
    }
    
    // --- NEW AUTHENTICATION LOGIC ---
    
    // 3. Initialize the authentication client.
    // It will automatically find and use the GOOGLE_APPLICATION_CREDENTIALS_JSON 
    // environment variable you created in Netlify.
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    
    // 4. Get a temporary access token.
    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;
    
    // 5. Get the Project ID from the auth client to build the URL.
    const projectId = await auth.getProjectId();
    const model = 'gemini-1.5-pro'; // You can use 'gemini-1.5-pro' now!
    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:streamGenerateContent`;

    // --- END OF NEW AUTHENTICATION LOGIC ---

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        topK: 40,
      }
    };

    // 6. Make the API call using the Access Token
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Use the token for authorization
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.json();
        console.error("Google API Error:", errorBody);
        return { statusCode: apiResponse.status, body: JSON.stringify({ error: "Failed to get a response from the AI model." }) };
    }

    const result = await apiResponse.json();
    
    // The response from a streaming API is an array of chunks. We need to combine them.
    let curriculumText = "";
    result.forEach(chunk => {
        if (chunk.candidates && chunk.candidates[0].content.parts[0].text) {
            curriculumText += chunk.candidates[0].content.parts[0].text;
        }
    });

    if (curriculumText) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ curriculum: curriculumText })
        };
    } else {
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
