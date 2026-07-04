import { useState } from 'react'
import useOnlineStatus from './hooks/useOnlineStatus'
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import NewBudget from './pages/NewBudget'
import EditBudget from './pages/EditBudget'
import Navbar from './components/Navbar'
import AppShell from './components/layout/AppShell'
import NewTransaction from './pages/NewTransaction'
import EditTransaction from './pages/EditTransaction'

function App() {
  const isOnline = useOnlineStatus()

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/new-transaction" element={<NewTransaction />} />
            <Route path="/edit-transaction/:transactionID" element={<EditTransaction />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/new-budget" element={<NewBudget />} />
            <Route path="/edit-budget/:budgetID" element={<EditBudget />} />
        </Routes>

        <Navbar />
      </AppShell>
    </BrowserRouter>


  );
}

export default App;