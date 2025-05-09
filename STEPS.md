### Steps of building the app:

1. `npm create @quick-start/electron@latest` : https://electron-vite.org/guide/
2. Added tailwind v4 with PostCSS: https://tailwindcss.com/docs/installation/using-postcss
3. Added shadcn ui with vite: https://ui.shadcn.com/docs/installation/vite
4. At the shadcn init step, there was an issue so then switched to manual installation: https://ui.shadcn.com/docs/installation/manual
5. For alias configuration, modify the tsconfig.json, tsconfig.web.json, electron.vite.config.ts
6. Switched back to tailwind v3 since the frontend from bolt.new was using tailwind v3 => removed the packages which were installed during v4 installation and then gone through the tailwind v3 installation
7. Installed a lower version of shadcn -> "shadcn@2.3.0" as recommended by the shadcn docs
8. Added the ui part from bolt.new to here
9. Had issues requesting external apis because by default, Electron has strict Content Security Policies that prevent making requests to external domains for security reasons. So added some config to allow requests to external domains -> modified main/index.ts and index.html
10. Again went to bolt.new for adding the MCP server functionality, in the settings tab -> kept an option to add the mcp server config and in the chat ui -> in the tools select popup, shown the no. of tools in the mcp config (no. of tools = no. of keys in the mcp config json)
11. Added the functionality to start & stop the mcp server (just the ui)
12. Added the functionality in settings tab to export all the localstorage items in a single json file and users can even import the json file to restore the localstorage items
13. Again import the whole thing from bolt.new to here
14. Create a demo pingFunc to invoke a test function in the main process through IPC
15. `pnpm i easy-mcp-use @langchain/openai`
16. Creating the startMcpServer, agentResponse, stopMcpServer functions in the main process and calling them through IPC from the renderer process (ChatPage.tsx)
17. Facing issues with the agentResponse function -> Specifically during the second agent call
18. Issue fixed by changing the approach, creating the client instance once during the start server func. call as it was earlier but creating the agent instance every time the agentResponse func. is called.
19. Created two functions in the main process, agentResponse and agentResponseWithMCP, agentResponseWithMCP is used when the MCP server is running or else the agentResponse function is called
20. Adding a search input in the llm model select popup inside settings tab
21. Added proper error message if the selected llm model is not capable of tool calling
22. Added Markdown rendering in the chat ui for the assistant messages
23. Modified the icon of the app in resources/icon.png and `pnpm run build` , `pnpm run build:mac`
24. Large file upload issues to Github using LFS, fix: Using GitHub Releases for distributing the installation files
