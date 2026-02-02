# RK Gaming Configurator - Electron

Standalone desktop application for the RK Gaming keyboard configurator. No browser needed.

## Prerequisites

- **Node.js** (v18 or later)

## Installation

```bash
git clone https://github.com/Flalal/RKGaming-electron.git
cd RKGaming-electron
npm install
```

## Usage

```bash
npm start
```

The app opens with full WebHID support. No browser needed, no certificate warning. The RK keyboard is detected automatically.

## Build Windows .exe

```bash
npm run build
```

The installer is generated in the `dist/` folder.

## How It Works

- Launches `server.mjs` as a child process to serve the web app
- Opens a Chromium window via Electron pointing to `https://localhost:8443`
- Self-signed certificate is auto-accepted
- WebHID permissions are automatically granted for RK Gaming devices (Vendor ID `0x1CA2`)
- No browser picker dialog - the RK keyboard is auto-selected

## Supported Keyboards

All RK Gaming keyboards with Vendor ID `0x1CA2` (7330), including RK C98 and 25+ other variants.

## Project Structure

```
RKGaming-electron/
├── main.js           # Electron main process
├── preload.js        # Electron preload script
├── package.json      # Dependencies & build config
├── app/              # Web app files (self-contained)
│   ├── server.mjs    # HTTPS server
│   ├── index.html    # Entry point
│   ├── *.js          # Vue.js bundles
│   ├── *.css         # Stylesheets
│   └── assets/       # Images & fonts
└── dist/             # Built .exe (after npm run build)
```
