const { app, BrowserWindow } = require("electron");

// Function to create a transparent window
function createWindow() {
  const window = new BrowserWindow({
    width: 0,
    height: 0,
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
