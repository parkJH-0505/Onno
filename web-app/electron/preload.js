const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,

    // Audio capture APIs
    startAudioCapture: () => ipcRenderer.invoke('start-audio-capture'),
    stopAudioCapture: () => ipcRenderer.invoke('stop-audio-capture'),

    // Audio stream events
    onAudioData: (callback) => {
        ipcRenderer.on('audio-data', (event, data) => callback(data));
    },

    // Window control
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
});
