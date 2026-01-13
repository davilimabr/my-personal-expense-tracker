/// <reference types="vite/client" />

interface Window {
    ipcRenderer: {
        readData: () => Promise<any[]>
        saveData: (data: any[]) => Promise<{ success: boolean; error?: string }>
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
        off: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    }
}
