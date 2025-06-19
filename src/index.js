const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

// Prompt for API key and model selection
readline.question('Enter your Google API key: ', (apiKey) => {
  readline.question('Enter model name (e.g., gemini-1.5-pro): ', (modelName) => {
    readline.close();
    
    // Create model with user-provided credentials
    try {
      const model = new ChatGoogleGenerativeAI({
        modelName: modelName,
        apiKey: apiKey,
      });
      console.log("Model instantiated successfully:", model);
      // Continue with agent initialization here
    } catch (error) {
      console.error("Model initialization failed:", error.message);
      process.exit(1);
    }
  });
});
