const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

// Vendor ID for RK Gaming keyboards
const RK_VENDOR_ID = 0x1ca2;

const SERVER_PORT = 8443;

// Resolve the path to the web app files (where server.mjs lives)
function getAppRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app-files");
  }
  return path.join(__dirname, "..", "RKGaming-offline");
}

// Start server.mjs as a child process
function startServer() {
  return new Promise((resolve, reject) => {
    const appRoot = getAppRoot();
    const serverPath = path.join(appRoot, "server.mjs");

    const child = spawn(process.execPath.includes("electron") ? "node" : "node", [serverPath], {
      cwd: appRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let started = false;

    child.stdout.on("data", (data) => {
      const msg = data.toString();
      console.log("[server]", msg.trim());
      if (!started && (msg.includes("localhost") || msg.includes("127.0.0.1"))) {
        started = true;
        resolve(child);
      }
    });

    child.stderr.on("data", (data) => {
      console.error("[server]", data.toString().trim());
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("exit", (code) => {
      if (!started) {
        reject(new Error(`server.mjs exited with code ${code}`));
      }
    });

    // Fallback: if server doesn't print anything in 5s, assume it's running
    setTimeout(() => {
      if (!started) {
        started = true;
        resolve(child);
      }
    }, 5000);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1680,
    height: 1050,
    title: "RK Gaming Configurator",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // --- WebHID Permissions ---

  // Layer 1: Allow RK Gaming devices at device-level
  win.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "hid") {
      const device = details.device;
      if (device && device.vendorId === RK_VENDOR_ID) {
        return true;
      }
    }
    return false;
  });

  // Layer 2: Allow HID permission checks
  win.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => {
      if (permission === "hid") {
        return true;
      }
      return true;
    }
  );

  // Layer 3: Auto-select RK keyboard (replaces browser HID picker)
  win.webContents.session.on(
    "select-hid-device",
    (event, details, callback) => {
      event.preventDefault();
      const rkDevice = details.deviceList.find(
        (d) => d.vendorId === RK_VENDOR_ID
      );
      if (rkDevice) {
        callback(rkDevice.deviceId);
      } else {
        callback();
      }
    }
  );

  // Load via HTTPS (server.mjs uses self-signed cert)
  win.loadURL(`https://localhost:${SERVER_PORT}/`);
}

// Ignore self-signed certificate errors for localhost
app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
  if (new URL(url).hostname === "localhost") {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

let serverProcess = null;

app.whenReady().then(async () => {
  try {
    serverProcess = await startServer();
    console.log("[Electron] server.mjs started");
  } catch (err) {
    console.error("[Electron] Failed to start server:", err.message);
    app.quit();
    return;
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
