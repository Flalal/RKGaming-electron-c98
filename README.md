# RK Gaming Configurator - Electron

Desktop application for the [RKGaming-offline](https://github.com/Flalal/RKGaming-offline) keyboard configurator.

## Prerequisites

- **Node.js** (v18 or later)
- [RKGaming-offline](https://github.com/Flalal/RKGaming-offline) cloned as a sibling folder

```
Documents/
├── RKGaming-offline/    # Web app files
└── RKGaming-electron/   # This repo
```

## Installation

```bash
git clone https://github.com/Flalal/RKGaming-offline.git
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

- Embeds a local HTTP server serving files from `../RKGaming-offline/`
- WebHID permissions are automatically granted for RK Gaming devices (Vendor ID `0x1CA2`)
- SPA routing for `/connect` and `/device` pages
- No browser picker dialog - the RK keyboard is auto-selected

## Supported Keyboards

All RK Gaming keyboards with Vendor ID `0x1CA2` (7330), including RK C98 and 25+ other variants.
