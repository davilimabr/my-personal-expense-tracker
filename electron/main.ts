import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
// @ts-ignore
import { parse } from 'csv-parse/sync'
// @ts-ignore
import { stringify } from 'csv-stringify/sync'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─ dist
// │ ├── index.html
// │ ├── assets
// │ └── ...
// ├─┬─ dist-electron
// │ ├── main.js
// │ └── preload.js
//
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

const DATA_FILE_PATH = path.join(app.getPath('userData'), 'data.csv')

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'app-icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// IPC Handlers
ipcMain.handle('read-data', async () => {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            // Create empty file with headers if needed, or just empty
            fs.writeFileSync(DATA_FILE_PATH, '')
            return []
        }
        const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8')
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true
        })
        return records
    } catch (error) {
        console.error('Error reading data:', error)
        return [] // Return empty on error
    }
})

ipcMain.handle('save-data', async (_event, data: any[]) => {
    try {
        const csvContent = stringify(data, {
            header: true,
            columns: [
                'id', 'type', 'date', 'description', 'value', 'category',
                'account', 'paymentMethod', 'status', 'notes', 'relatedId'
            ] // Explicit columns to ensure order
        })
        fs.writeFileSync(DATA_FILE_PATH, csvContent)
        return { success: true }
    } catch (error: any) {
        console.error('Error saving data:', error)
        return { success: false, error: error.message }
    }
})

app.whenReady().then(createWindow)
