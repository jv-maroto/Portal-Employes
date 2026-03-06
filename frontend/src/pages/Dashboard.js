import React from 'react';
import { RecentAnnouncements } from '../components/RecentAnnouncements';
import { DashboardHeader } from '../components/DashboardHeader';
import { VacationSummary } from '../components/VacationSummary';
import { RecentPayslips } from '../components/RecentPayslips';
import { MiniCalendar } from '../components/MiniCalendar';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background w-full">
      <DashboardHeader />
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-5">
            <VacationSummary />
            <RecentPayslips />
          </div>
          <div className="lg:col-span-1">
            <MiniCalendar />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <RecentAnnouncements />
          </div>
        </div>
      </main>
    </div>
  );
}
