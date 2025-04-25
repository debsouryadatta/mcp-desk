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