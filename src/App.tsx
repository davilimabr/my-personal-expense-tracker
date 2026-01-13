import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Dashboard } from "./pages/Dashboard"
import { Expenses } from "./pages/Expenses"
import { Incomes } from "./pages/Incomes"
import { Accounts } from "./pages/Accounts"
import { Budget } from "./pages/Budget"
import { Ledger } from "./pages/Ledger"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="incomes" element={<Incomes />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="budget" element={<Budget />} />
        <Route path="ledger" element={<Ledger />} />
      </Route>
    </Routes>
  )
}

export default App
