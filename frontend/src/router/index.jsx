import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import HomePage from '../pages/HomePage.jsx';
import CatalogPage from '../pages/CatalogPage.jsx';
import EventsPage from '../pages/EventsPage.jsx';
import PlansPage from '../pages/PlansPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { RequireAdmin } from './RequireAdmin.jsx';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'biblioteca', element: <CatalogPage /> },
        { path: 'eventos', element: <EventsPage /> },
        { path: 'planes-lectores', element: <PlansPage /> },
        { path: 'perfil', element: <ProfilePage /> },
        { path: 'admin/login', element: <AdminLoginPage /> },
        {
          path: 'admin',
          element: (
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          ),
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { future: { v7_startTransition: true } }
);
