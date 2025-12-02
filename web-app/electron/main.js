const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

// Check for development environment
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let hudWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: true,
        titleBarStyle: 'default',
        show: false
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../out/index.html')}`;

    console.log('Loading Main URL:', startUrl);

    mainWindow.loadURL(startUrl).catch(e => {
        console.error('Failed to load Main URL:', e);
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        createHUDWindow();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (hudWindow) {
            hudWindow.close();
        }
    });
}

function createHUDWindow() {
    hudWindow = new BrowserWindow({
        width: 400,
        height: 600,
        x: 50,
        y: 100,
        // Debugging: Make it visible
        frame: true,
        transparent: false,
        backgroundColor: '#202020',
        alwaysOnTop: true,
        resizable: true,
        skipTaskbar: false, // Show in taskbar for debugging
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const hudUrl = isDev
        ? 'http://localhost:3000/hud'
        : `file://${path.join(__dirname, '../out/hud.html')}`;

    console.log('Loading HUD URL:', hudUrl);

    hudWindow.loadURL(hudUrl).catch(e => {
        console.error('Failed to load HUD URL:', e);
    });

    hudWindow.setIgnoreMouseEvents(false);

    if (isDev) {
        // hudWindow.webContents.openDevTools({ mode: 'detach' });
    }

    hudWindow.on('closed', () => {
        hudWindow = null;
    });
}

// IPC Handlers
ipcMain.handle('start-audio-capture', async () => {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['window', 'screen'],
            thumbnailSize: { width: 0, height: 0 }
        });
        return sources.map(source => ({ id: source.id, name: source.name }));
    } catch (error) {
        console.error('Error getting audio sources:', error);
        return [];
    }
});

ipcMain.handle('stop-audio-capture', async () => {
    return { success: true };
});

ipcMain.on('minimize-window', () => {
    if (hudWindow) hudWindow.minimize();
});

ipcMain.on('close-window', () => {
    if (hudWindow) hudWindow.close();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
