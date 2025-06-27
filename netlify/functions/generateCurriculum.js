// Located at: netlify/functions/generateCurriculum.js
// FINAL VERSION: This code explicitly loads credentials from the environment variable.

const { GoogleAuth } = require('google-auth-library');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    if (!prompt) {
      throw new Error("No prompt was provided.");
    }
    
    // --- THIS IS THE CRUCIAL FIX ---
    
    // 3. Get the JSON credentials from the environment variable you created.
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson) {
      // This will provide a clear error if the environment variable is not set correctly.
      throw new Error("The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.");
    }
    // Parse the JSON string into a JavaScript object.
    const credentials = JSON.parse(credentialsJson);

    // 4. Initialize the authentication client, passing the credentials DIRECTLY.
    const auth = new GoogleAuth({
      credentials, // Pass the parsed credentials object right here
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    
    // --- END OF THE FIX ---

    // 5. Get a temporary access token.
    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;
    
    const projectId = await auth.getProjectId();
    const model = 'gemini-1.5-pro';
    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:streamGenerateContent`;

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
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
