#!/usr/bin/env node

// Import necessary modules
import {
  START,
  StateGraph,
  CompiledStateGraph,
  AnnotationRoot,
  MessagesAnnotation,
  Annotation,
  ToolNode,
  ToolExecutor, // Import ToolExecutor
} from "@langchain/langgraph/prebuilt"; // Import from prebuilt
import { HumanMessage, AIMessage, FunctionMessage } from "@langchain/core/messages"; // Import FunctionMessage
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StructuredTool, tool } from "@langchain/core/tools";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { Runnable } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai"; // Assuming OpenAI is used for the LLM
import { z } from "zod";
import { AgentAction } from "@langchain/core/agents"; // Import AgentAction
import * as fs from 'fs/promises'; // Import Node.js file system module

// Assuming swarm.ts is available or built into a local module
// import { createSwarm, SwarmState } from "./swarm"; 

process.stdin.setEncoding('utf8');

process.stdin.on('data', (data) => {
  const messages = data.split('\n').filter(line => line.trim() !== '');
  messages.forEach(message => {
    try {
      const jsonRpcMessage = JSON.parse(message);
      handleJsonRpcMessage(jsonRpcMessage);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      // Send a JSON-RPC parse error response
      sendJsonRpcError(null, -32700, 'Parse error', error.message);
    }
  });
});

process.stdin.on('end', () => {
  console.log('Stdin closed.');
});

async function handleJsonRpcMessage(message) {
  console.log('Received JSON-RPC message:', JSON.stringify(message)); // Add logging

  // Basic handling for demonstration
  if (message.jsonrpc !== '2.0') {
    sendJsonRpcError(message.id || null, -32600, 'Invalid Request', 'Invalid JSON-RPC version');
    return;
  }

  switch (message.method) {
    case 'initialize':
      // Handle initialize request
      console.log('Handling initialize request...'); // Add logging
      // Ensure swarm is initialized before responding
      if (!langGraphSwarm) {
        await initializeSwarm();
      }
      // Send initialize response with capabilities
      const initializeResponse = { // Capture response for logging
        capabilities: {
          tools: {
            list: true,
            call: true,
          },
          // Add other supported capabilities as needed
        },
        serverInfo: {
          name: 'langgraph-swarm-mcp',
          version: '1.0.0', // Replace with actual version if available
          implementation: 'Node.js',
        },
      };
      console.log('Sending initialize response:', JSON.stringify(initializeResponse)); // Add logging
      sendJsonRpcResponse(message.id, initializeResponse);
      break;
    case 'notifications/initialized':
      // Handle initialized notification
      console.log('Handling initialized notification...'); // Add logging
      // The client has confirmed initialization is complete
      break;
    case 'tools/list':
      // Handle tools/list request
      console.log('Handling tools/list request...'); // Add logging
      // Ensure swarm is initialized
      if (!langGraphSwarm) {
        sendJsonRpcError(message.id, -32603, 'Internal error', 'LangGraph Swarm not initialized');
        return;
      }
      // Send the list of available tools
      const toolsListResponse = { tools: availableTools }; // Capture response for logging
      console.log('Sending tools/list response:', JSON.stringify(toolsListResponse)); // Add logging
      sendJsonRpcResponse(message.id, toolsListResponse);
      break;
    case 'tools/call':
      // Handle tools/call request
      console.log('Handling tools/call request...'); // Add logging
      // Ensure swarm is initialized
      if (!langGraphSwarm) {
        sendJsonRpcError(message.id, -32603, 'Internal error', 'LangGraph Swarm not initialized');
        return;
      }
      // Extract tool name and arguments
      const toolName = message.params?.name;
      const toolArguments = message.params?.arguments;

      if (!toolName || toolArguments === undefined) {
        sendJsonRpcError(message.id, -32602, 'Invalid params', 'Missing tool name or arguments');
        return;
      }

      console.log(`Calling tool: ${toolName} with arguments:`, toolArguments);

      // Simulate an AgentAction based on the MCP tool call request
      const simulatedAgentAction = {
        tool: toolName,
        toolInput: toolArguments, // Assuming toolArguments is already in the correct format for the tool
        log: `Simulating call to tool ${toolName}`, // Add a log if needed
      };

      try {
        // Use the ToolExecutor to execute the tool
        const toolResult = await toolExecutor.invoke(simulatedAgentAction);

        // Format the tool result into MCP CallToolResult format
        // The format of toolResult depends on the tool, so we'll wrap it in a text Content for simplicity
        const mcpResult = {
          result: [{ type: 'text', text: String(toolResult) }], // Convert result to string
          is_error: false,
        };

        sendJsonRpcResponse(message.id, mcpResult);

      } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        // Send an MCP error response
        sendJsonRpcResponse(message.id, {
          result: [],
          is_error: true,
          error: {
            code: -32603, // Internal error
            message: `Error executing tool ${toolName}`,
            data: error.message,
          },
        });
      }

      break;
    // Add other MCP methods as needed
    default:
      sendJsonRpcError(message.id || null, -32601, 'Method not found', `Method "${message.method}" not found`);
      break;
  }
}

// Define State (simplified for this example)
const AgentState = Annotation.Root({
  messages: Annotation<Array<HumanMessage | AIMessage>>({
    reducer: (x, y) => x.concat(y),
  }),
  // Add other state fields as needed by your agents
});

// Helper function to create a basic agent
async function createBasicAgent({ llm, tools, systemMessage }) {
  const toolNames = tools.map((tool) => tool.name).join(", ");
  const formattedTools = tools.map((t) => convertToOpenAITool(t));

  let prompt = ChatPromptTemplate.fromMessages([
    ["system", systemMessage + "\n\nYou have access to the following tools: {tool_names}"],
    new MessagesPlaceholder("messages"),
  ]);
  prompt = await prompt.partial({ tool_names: toolNames });

  return prompt.pipe(llm.bind({ tools: formattedTools }));
}

// Define file and folder handling tools
const createFileTool = tool(
  async ({ path, content = '' }) => {
    try {
      await fs.writeFile(path, content);
      return `File created successfully at ${path}`;
    } catch (error) {
      console.error(`Error creating file ${path}:`, error);
      throw new Error(`Failed to create file ${path}: ${error.message}`);
    }
  },
  {
    name: "create_file",
    description: "Creates a new file at the specified path with optional content.",
    schema: z.object({
      path: z.string().describe("The path where the file should be created."),
      content: z.string().optional().describe("The content to write to the file (optional)."),
    }),
  }
);

const readFileTool = tool(
  async ({ path }) => {
    try {
      const content = await fs.readFile(path, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  },
  {
    name: "read_file",
    description: "Reads the content of the file at the specified path.",
    schema: z.object({
      path: z.string().describe("The path of the file to read."),
    }),
  }
);

const updateFileTool = tool(
  async ({ path, content }) => {
    try {
      await fs.writeFile(path, content);
      return `File updated successfully at ${path}`;
    } catch (error) {
      console.error(`Error updating file ${path}:`, error);
      throw new Error(`Failed to update file ${path}: ${error.message}`);
    }
  },
  {
    name: "update_file",
    description: "Updates the content of the file at the specified path.",
    schema: z.object({
      path: z.string().describe("The path of the file to update."),
      content: z.string().describe("The new content for the file."),
    }),
  }
);

const deleteFileTool = tool(
  async ({ path }) => {
    try {
      await fs.unlink(path);
      return `File deleted successfully at ${path}`;
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      throw new Error(`Failed to delete file ${path}: ${error.message}`);
    }
  },
  {
    name: "delete_file",
    description: "Deletes the file at the specified path.",
    schema: z.object({
      path: z.string().describe("The path of the file to delete."),
    }),
  }
);

const createFolderTool = tool(
  async ({ path }) => {
    try {
      await fs.mkdir(path, { recursive: true });
      return `Folder created successfully at ${path}`;
    } catch (error) {
      console.error(`Error creating folder ${path}:`, error);
      throw new Error(`Failed to create folder ${path}: ${error.message}`);
    }
  },
  {
    name: "create_folder",
    description: "Creates a new folder at the specified path. Creates parent folders if they don't exist.",
    schema: z.object({
      path: z.string().describe("The path where the folder should be created."),
    }),
  }
);

const deleteFolderTool = tool(
  async ({ path }) => {
    try {
      await fs.rm(path, { recursive: true, force: true });
      return `Folder deleted successfully at ${path}`;
    } catch (error) {
      console.error(`Error deleting folder ${path}:`, error);
      throw new Error(`Failed to delete folder ${path}: ${error.message}`);
    }
  },
  {
    name: "delete_folder",
    description: "Deletes the folder at the specified path. Deletes contents recursively.",
    schema: z.object({
      path: z.string().describe("The path of the folder to delete."),
    }),
  }
);


// Placeholder for LangGraph Swarm initialization
let langGraphSwarm = null;
let availableTools = [];
let toolExecutor = null; // Add ToolExecutor instance

async function initializeSwarm() {
  console.log("Initializing LangGraph Swarm...");

  // Define all available tools
  const allTools = [
    createFileTool,
    readFileTool,
    updateFileTool,
    deleteFileTool,
    createFolderTool,
    deleteFolderTool,
    // Keep the dummy tool for now, or remove if no longer needed
    // dummyTool,
  ];

  // Create ToolExecutor with all available tools
  toolExecutor = new ToolExecutor({ tools: allTools });

  // Assuming OpenAI API key is available as an environment variable
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error("OPENAI_API_KEY environment variable not set.");
    // In a real application, you might want to exit or handle this differently
  }

  const llm = new ChatOpenAI({ apiKey: openaiApiKey, modelName: "gpt-4o" }); // Use gpt-4o as a default

  // Define a simple agent with the dummy tool
  const basicAgent = await createBasicAgent({
    llm,
    tools: [dummyTool],
    systemMessage: "You are a basic agent with a dummy tool.",
  });

  // Define the graph (simplified)
  const workflow = new StateGraph(AgentState);

  workflow.addNode("basic_agent", async (state) => {
    const result = await basicAgent.invoke(state.messages);
    return { messages: [result] };
  });

  workflow.addNode("call_tool", new ToolNode([dummyTool]));

  // Define edges (simplified)
  workflow.addEdge(START, "basic_agent");
  workflow.addEdge("basic_agent", "call_tool"); // Always call tool after agent for this simple example
  workflow.addEdge("call_tool", "basic_agent"); // Loop back to agent after tool call

  // Compile the graph
  langGraphSwarm = workflow.compile();

  // Populate available tools for discovery by Goose
  availableTools = allTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    schema: tool.schema,
  }));


  console.log("LangGraph Swarm initialized.");
}

// Initialize the swarm when the process starts
initializeSwarm().catch(console.error);


function sendJsonRpcResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id: id,
    result: result,
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendJsonRpcError(id, code, message, data) {
  const errorResponse = {
    jsonrpc: '2.0',
    id: id,
    error: {
      code: code,
      message: message,
      data: data,
    },
  };
  process.stdout.write(JSON.stringify(errorResponse) + '\n');
}

function sendJsonRpcNotification(method, params) {
  const notification = {
    jsonrpc: '2.0',
    method: method,
    params: params,
  };
  process.stdout.write(JSON.stringify(notification) + '\n');
}
