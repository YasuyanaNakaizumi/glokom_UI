import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { DashboardView } from './views/DashboardView';
import { StockCalendarView } from './views/StockCalendarView';
import { FleetView } from './views/FleetView';
import { VehicleListView } from './views/VehicleListView';
import { CustomerListView } from './views/CustomerListView';
import { TasksView } from './views/TasksView';
import { ScheduleView } from './views/ScheduleView';
import { MasterView } from './views/MasterView';
import { ReportsView } from './views/ReportsView';
import { CategoryTasksView } from './views/CategoryTasksView';
import { AppListView } from './views/AppListView';

const AppContent = () => {

  const { view } = useApp();

  let CurrentView: React.FC = DashboardView;
  switch (view) {
    case 'home': CurrentView = DashboardView; break;
    case 'vehicles': CurrentView = VehicleListView; break;
    case 'customers': CurrentView = CustomerListView; break;
    case 'fleet': CurrentView = FleetView; break;
    case 'tasks': CurrentView = TasksView; break;
    case 'tasks_patrol': CurrentView = () => <CategoryTasksView categoryKey="patrol" />; break;
    case 'tasks_fc': CurrentView = () => <CategoryTasksView categoryKey="fc" />; break;
    case 'tasks_repair': CurrentView = () => <CategoryTasksView categoryKey="repair" />; break;
    case 'tasks_maintenance': CurrentView = () => <CategoryTasksView categoryKey="maintenance" />; break;
    case 'tasks_inspection': CurrentView = () => <CategoryTasksView categoryKey="inspection" />; break;
    case 'schedule': CurrentView = ScheduleView; break;
    case 'master': CurrentView = MasterView; break;
    case 'stock_calendar': CurrentView = StockCalendarView; break;
    case 'reports': CurrentView = ReportsView; break;
    case 'app_list': CurrentView = AppListView; break;
  }

  return (
    <Layout>
      <CurrentView />
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
