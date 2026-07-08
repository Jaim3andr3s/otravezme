import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import HomePage from '../pages/HomePage.jsx';
import CatalogPage from '../pages/CatalogPage.jsx';
import EventsPage from '../pages/EventsPage.jsx';
import PlansPage from '../pages/PlansPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import GamesHubPage from '../pages/GamesHubPage.jsx';
import TriviaGamePage from '../pages/games/TriviaGamePage.jsx';
import MemoryGamePage from '../pages/games/MemoryGamePage.jsx';
import HangmanGamePage from '../pages/games/HangmanGamePage.jsx';
import PuzzleGamePage from '../pages/games/PuzzleGamePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { RequireAdmin } from './RequireAdmin.jsx';
import { RequireUser } from './RequireUser.jsx';

const withUser = (element) => <RequireUser>{element}</RequireUser>;

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
        { path: 'ingresar', element: <LoginPage /> },
        { path: 'perfil', element: withUser(<ProfilePage />) },
        { path: 'juegos', element: withUser(<GamesHubPage />) },
        { path: 'juegos/trivia', element: withUser(<TriviaGamePage />) },
        { path: 'juegos/memorama', element: withUser(<MemoryGamePage />) },
        { path: 'juegos/ahorcado', element: withUser(<HangmanGamePage />) },
        { path: 'juegos/rompecabezas', element: withUser(<PuzzleGamePage />) },
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
