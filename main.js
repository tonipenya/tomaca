const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

ipcMain.on('timer-updated', (evt, timeLeft, percentageLeft) => {
  tray.setTitle(timeLeft)
  const trayIcon = percentageLeft < 100 ?
                    `trayIconProgress/progress_${percentageLeft}.png`
                    : 'trayIcon.png'
  tray.setImage(path.join(assetsDirectory, trayIcon))
})

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'trayIcon.png'))

  const contextMenu = Menu.buildFromTemplate([
      {label: 'Quit Tomaca', type: 'normal', role: 'quit'}
    ])

  tray.on('right-click', () => {
    window.hide()
    tray.popUpContextMenu(contextMenu)
  })
  tray.on('click', toggleWindow)
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

ipcMain.on('show-window', showWindow)
