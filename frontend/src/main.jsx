import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import App from './App';
import ScannerView from './components/ScannerView';
import AddBoxView from './components/AddBoxView';
import BoxDetailView from './components/BoxDetailView';
import BoxesListView from './components/BoxesListView';
import LocationsListView from './components/LocationsListView';
import AddLocationView from './components/AddLocationView';
import SettingsView from './components/SettingsView';
import NotificationsView from './components/NotificationsView';
import ItemsListView from './components/ItemsListView';
import SearchView from './components/SearchView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './components/NotificationContext';
import { ThemeProvider } from './components/ThemeContext';
import './index.css';

const Main = () => (
  <ThemeProvider>
    <NotificationProvider>
      <Router>
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<App />} />
          <Route path="scanner" element={<ScannerView />} />
          <Route path="add-box" element={<AddBoxView />} />
          <Route path="boxes" element={<BoxesListView />} />
          <Route path="boxes/:id" element={<BoxDetailView />} />
          <Route path="locations" element={<LocationsListView />} />
          <Route path="add-location" element={<AddLocationView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="notifications" element={<NotificationsView />} />
          <Route path="items" element={<ItemsListView />} />
        </Route>
      </Routes>
    </Router>
  </NotificationProvider>
  </ThemeProvider>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>
);

