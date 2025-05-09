import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { agentResponse, agentResponseWithMCP, pingFunc, startMcpServer, stopMcpServer } from './lib'

// Set app name globally
app.name = 'MCP Desk'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    show: false,
    title: 'MCP Desk',
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })

  // Set Content Security Policy
  // This is more permissive for development purposes
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data: https://* blob:; " +
          "font-src 'self' data:; " +
          "connect-src 'self' https://* http://* ws: wss:; " +
          "media-src 'self' https://* http://*;"
        ]
      }
    })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app name
  app.setName('MCP Desk')
  
  // For macOS, set the dock menu name
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon)
  }
  
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.mcp-desk')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('pingFunc', (_, ...args: any[]) => pingFunc(...args))
  ipcMain.handle('startMcpServer', (_, ...args: any[]) => startMcpServer(...args))
  ipcMain.handle('stopMcpServer', (_, ...args: any[]) => stopMcpServer(...args))
  ipcMain.handle('agentResponse', (_, ...args: any[]) => agentResponse(...args))
  ipcMain.handle('agentResponseWithMCP', (_, ...args: any[]) => agentResponseWithMCP(...args))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
