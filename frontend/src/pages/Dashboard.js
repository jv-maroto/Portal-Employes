import React from 'react';
import { RecentAnnouncements } from '../components/RecentAnnouncements';
import { DashboardHeader } from '../components/DashboardHeader';
import { VacationSummary } from '../components/VacationSummary';
import { RecentPayslips } from '../components/RecentPayslips';
import { MiniCalendar } from '../components/MiniCalendar';

// Nominas import removed as it's not used
import '../static/css/homepage.css';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100  w-full max-w-full mx-auto">
      <DashboardHeader />
      <main className="container mx-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <VacationSummary />
            <RecentPayslips />
          </div>
          <div className="space-y-4">
            <MiniCalendar />
          </div>
          <div>
            <RecentAnnouncements />
          </div>
        </div>
      </main>
    </div>
  );
}

