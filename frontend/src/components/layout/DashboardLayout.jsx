import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-wrapper">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
