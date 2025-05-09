import { MCPClient } from 'easy-mcp-use';
import { MCPAgent } from 'easy-mcp-use';
import { ChatOpenAI } from '@langchain/openai';

let clientInstance: MCPClient | null = null;


export const pingFunc = (...args: any[]) => {
  console.log('pong', args)
  return 'pong'
}

export const startMcpServer = async (...args: any[]) => {
  try { 
    console.log('Starting MCP server...')
    const config = args[0]
    const apiKey = args[1]
    if (!apiKey) throw new Error('API key not found')
      
    const client = MCPClient.fromConfig( config );
    clientInstance = client;
  } catch (error) {
    console.error('Error starting MCP server:', error)
    throw error
  }
}

export const agentResponse = async (...args: any[]) => {
  try {
    console.log('Generating response from agentResponse...')
    const apiKey = args[1]
    const selectedModel = args[2]
    const chat = new ChatOpenAI(
      {
        modelName: selectedModel, 
        streaming: true,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',  
        }
      }
    );
    const client = MCPClient.fromConfig( {} );
    let options = {
      client: client,
      // verbose: true,
      maxSteps: 30, 
      llm:  chat,
    }
    const agent = new MCPAgent(options)
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


export const agentResponseWithMCP = async (...args: any[]) => {
  try {
    console.log('Generating response from agentResponseWithMCP...')
    const apiKey = args[1]
    const selectedModel = args[2]
    const chat = new ChatOpenAI(
      {
        modelName: selectedModel, 
        streaming: true,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',  
        }
      }
    );
    let options = {
      client: clientInstance,
      // verbose: true,
      maxSteps: 30, 
      llm:  chat,
    }
    const agent = new MCPAgent(options)
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
