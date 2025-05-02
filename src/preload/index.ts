import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    pingFunc: (...args: any[]) => ipcRenderer.invoke('pingFunc', ...args),
    startMcpServer: (...args: any[]) => ipcRenderer.invoke('startMcpServer', ...args),
    stopMcpServer: (...args: any[]) => ipcRenderer.invoke('stopMcpServer', ...args),
    agentResponse: (...args: any[]) => ipcRenderer.invoke('agentResponse', ...args)
  })
} catch (error) {
  console.error(error)
}
