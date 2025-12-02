// Electron API types
interface ElectronAPI {
    platform: string
    startAudioCapture: () => Promise<Array<{ id: string; name: string }>>
    stopAudioCapture: () => Promise<{ success: boolean }>
    onAudioData: (callback: (data: any) => void) => void
    minimizeWindow: () => void
    closeWindow: () => void
}

declare global {
    interface Window {
        electron: ElectronAPI
    }
}

export { }
