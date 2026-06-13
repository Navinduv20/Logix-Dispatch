import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TrackingPage from './pages/TrackingPage';
import DispatcherPage from './pages/DispatcherPage';
import DriverPage from './pages/DriverPage';
import ManagerReportsPage from './pages/ManagerReportsPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import NotificationToast from './components/NotificationToast';

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/track/:id" element={<TrackingPage />} />
          <Route path="/portal" element={<CustomerPortalPage />} />
          <Route path="/dispatcher" element={<DispatcherPage />} />
          <Route path="/driver/:driverId" element={<DriverPage />} />
          <Route path="/manager" element={<ManagerReportsPage />} />
        </Route>
      </Routes>
      <NotificationToast />
    </>
  );
}
