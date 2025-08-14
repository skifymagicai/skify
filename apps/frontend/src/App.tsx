import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analyze from './pages/Analyze';
import Templates from './pages/Templates';
import ExportPage from './pages/Export';
import Payment from './pages/Payment';
import Onboarding from './pages/Onboarding';
import Accessibility from './pages/Accessibility';
import Jobs from './pages/Jobs';
import Settings from './pages/Settings';


const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/export" element={<ExportPage />} />
      <Route path="/payment" element={<Payment />} />
  <Route path="/onboarding" element={<Onboarding />} />
  <Route path="/accessibility" element={<Accessibility />} />
  <Route path="/jobs" element={<Jobs />} />
  <Route path="/settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
);

export default App;
