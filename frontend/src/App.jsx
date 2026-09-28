import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import CycloneDetail from './pages/CycloneDetail';
import DataIngestion from './pages/DataIngestion';
import HistoricalPatterns from './pages/HistoricalPatterns';
import AlertCenter from './pages/AlertCenter';
import SafetyShelters from './pages/SafetyShelters';
import ModelEvaluation from './pages/ModelEvaluation';
import AdminConsole from './pages/AdminConsole';
import LoginRegister from './pages/LoginRegister';

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
            {/* Top Mandatory DEMO DATA SIH2026 Banner */}
            <DemoBanner />
            
            {/* Main Navigation Bar */}
            <Navbar />

            {/* Body Layout: Sidebar + Main Content */}
            <div className="flex-1 flex overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#091024]">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/cyclones/:id" element={<CycloneDetail />} />
                  <Route path="/ingestion" element={<DataIngestion />} />
                  <Route path="/historical" element={<HistoricalPatterns />} />
                  <Route path="/alerts" element={<AlertCenter />} />
                  <Route path="/safety" element={<SafetyShelters />} />
                  <Route path="/models" element={<ModelEvaluation />} />
                  <Route path="/admin" element={<AdminConsole />} />
                  <Route path="/auth" element={<LoginRegister />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
