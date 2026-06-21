import { useState } from 'react'
import useOnlineStatus from './hooks/useOnlineStatus'
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budgets from './pages/Budgets'
import NewBudget from './components/NewBudget'
import Navbar from './components/Navbar'
import AppShell from './components/layout/AppShell'

function App() {
  const isOnline = useOnlineStatus()

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/new-budget" element={<NewBudget />} />
        </Routes>

        <Navbar />
      </AppShell>
    </BrowserRouter>


  );
}

export default App;