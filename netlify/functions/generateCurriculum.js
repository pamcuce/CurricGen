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

      const apiUrl =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
          return { statusCode: apiResponse.status, body: JSON.stringify({ error: "Failed to get a response
  from the AI model." }) };
      }

      const result = await apiResponse.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0)
  {
          const curriculumText = result.candidates[0].content.parts[0].text;
          return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ curriculum: curriculumText })
          };
      } else {
          // Handle cases where the model returns no candidates (e.g., safety settings)
          console.error("Invalid response structure from API:", result);
          return { statusCode: 500, body: JSON.stringify({ error: "Received an invalid or empty response from
  the AI model." }) };
      }

    } catch (error) {
      console.error("Serverless function error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  };

✦ I've reviewed your Netlify function generateCurriculum.js.


  This is a solid serverless function. It correctly:
   * Acts as a secure backend proxy to the Google AI API.
   * Keeps your GEMINI_API_KEY private using environment variables.
   * Handles POST requests and includes good error checking.
   * Parses the response from the Gemini API and returns it to your frontend.

  The code for both the frontend and the backend looks quite good.


  How can I help you with this project? Are you running into any issues, or is there something you'd like to
   add or change?

> this is supposed to print out an optimized curriculum and i would like to optimize the prompt to be able to
  do that so that it is getting optimized content and has an opimized structure

✦ Of course. Optimizing the prompt is the best way to improve the quality and structure of the curriculum
  you're generating. A well-crafted prompt can guide the AI to produce a more detailed, logically structured,
  and actionable learning plan.


  I will now read the generateCurriculum.js file to get the current prompt.
 ╭───────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  ReadFile ...etlify\functions\generateCurriculum.js                                             │
 │                                                                                                   │
 │    File not found.                                                                                │
 ╰───────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ I apologize, it seems I don't have access to the generateCurriculum.js file in that location. Could you
  please provide the content of the file again? I'll then be able to help you optimize the prompt.

> // Located at: netlify/functions/generateCurriculum.js

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

      const apiUrl =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
          return { statusCode: apiResponse.status, body: JSON.stringify({ error: "Failed to get a response
  from the AI model." }) };
      }

      const result = await apiResponse.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0)
  {
          const curriculumText = result.candidates[0].content.parts[0].text;
          return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ curriculum: curriculumText })
          };
      } else {
          // Handle cases where the model returns no candidates (e.g., safety settings)
          console.error("Invalid response structure from API:", result);
          return { statusCode: 500, body: JSON.stringify({ error: "Received an invalid or empty response from
  the AI model." }) };
      }

    } catch (error) {
      console.error("Serverless function error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  };
