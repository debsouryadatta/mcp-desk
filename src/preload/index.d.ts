
declare global {
  interface Window {
    // electron: ElectronAPI
    context: {
      locale: string
      pingFunc: (...args: any[]) => Promise<any>
      startMcpServer: (...args: any[]) => Promise<any>
      stopMcpServer: (...args: any[]) => Promise<any>
      agentResponse: (...args: any[]) => Promise<any>
      agentResponseWithMCP: (...args: any[]) => Promise<any>
    }
  }
}