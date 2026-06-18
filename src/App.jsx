import { useState } from 'react'
import useOnlineStatus from './hooks/useOnlineStatus'
import Offline from './components/Offline'
import InstallPrompt from './components/InstallPrompt'
import {BrowserRouter, Route, Routes, Link} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Budgets from './pages/Budgets'
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
        </Routes>

        <Navbar />
      </AppShell>
    </BrowserRouter>


  );
}

export default App;