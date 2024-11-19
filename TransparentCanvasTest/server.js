const { app, BrowserWindow } = require("electron");

// Function to create a transparent window
function createWindow() {
  const window = new BrowserWindow({
    width: 600,
    height: 800,
    transparent: true,
    frame: false,
    fullscreen: true,
    alwaysOnTop: true,
    webPreferences: {nodeIntegration: true}
  })

  window.loadFile("public/index.html")
}

app.whenReady().then(()=>{
  createWindow()

  app.on("activate", ()=>{
    if (!BrowserWindow.getAllWindows().length) createWindow()
  })
})

app.on("window-all-closed", ()=>app.quit())
