import { MCPClient } from 'easy-mcp-use';
import { MCPAgent } from 'easy-mcp-use';
import { ChatOpenAI } from '@langchain/openai';

let clientInstance: MCPClient | null = null;
let agentInstance: MCPAgent | null = null;


export const pingFunc = (...args: any[]) => {
  console.log('pong', args)
  return 'pong'
}

export const startMcpServer = async (...args: any[]) => {
  console.log('Starting MCP server...')
  const config = args[0]
  const apiKey = args[1]
  if (!apiKey) throw new Error('API key not found')
    
  const client = MCPClient.fromConfig( config );
  try { 
    const chat = new ChatOpenAI(
      {
        modelName: 'google/gemini-2.0-flash-001', 
        streaming: true,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',  
        }
      }
    );
    let options = {
      client: client,
      // verbose: true,
      maxSteps: 30, 
      llm:  chat,
    }
    const agent = new MCPAgent(options)
    clientInstance = client;
    agentInstance = agent;
  } catch (error) {
    console.error('Error starting MCP server:', error)
    throw error
  }
}

export const agentResponse = async (...args: any[]) => {
  try {
    console.log('Generating response...')
    const agent = agentInstance
    const messages = args[0]
    const formattedMessages = messages.map((message: any) => {
      return {
        role: message.role,
        content: message.content
      }
    })
    console.log('Formatted messages:', formattedMessages)
    const response = await agent.run({
      messages: formattedMessages,
    })
    return { response: response.output }
  } catch (error) {
    console.error('Error generating response:', error)
    throw error
  }
}

export const stopMcpServer = async (...args: any[]) => {
  try {
    console.log('Stopping MCP server...')
    if (!clientInstance) throw new Error('Client instance not found')
    await clientInstance.closeAllSessions();
  } catch (error) {
    console.log('Error stopping MCP server:', error)
    throw error
  }
}
