import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function Layout() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
