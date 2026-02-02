const { contextBridge } = require("electron");

// Force English language before Vue.js reads localStorage
localStorage.setItem("lang", "en");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
});
