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
import WordsearchGamePage from '../pages/games/WordsearchGamePage.jsx';
import CrosswordGamePage from '../pages/games/CrosswordGamePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { RequireAdmin } from './RequireAdmin.jsx';
import { RequireUser } from './RequireUser.jsx';
import { HomeOrLogin } from '../pages/HomeOrLogin.jsx';

// Fase A
import GalleryPage from '../pages/GalleryPage.jsx';
import BookOfMonthPage from '../pages/BookOfMonthPage.jsx';
import BadgesPage from '../pages/BadgesPage.jsx';

// Fase B
import PublicationPage from '../pages/PublicationPage.jsx';

// Fase D
import ReadingChallengesPage from '../pages/ReadingChallengesPage.jsx';

// Fase E
import DiplomaPage from '../pages/DiplomaPage.jsx';

// Fase F - Foro y Actividades
import ForumPage from '../pages/ForumPage.jsx';
import ActivitiesPage from '../pages/ActivitiesPage.jsx';

const withUser = (element) => <RequireUser>{element}</RequireUser>;

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <HomeOrLogin /> },
        { path: 'biblioteca', element: <CatalogPage /> },
        { path: 'eventos', element: <EventsPage /> },
        { path: 'planes-lectores', element: <PlansPage /> },
        { path: 'perfil', element: withUser(<ProfilePage />) },
        { path: 'perfil/diplomas', element: withUser(<DiplomaPage />) },
        { path: 'juegos', element: withUser(<GamesHubPage />) },
        { path: 'juegos/trivia', element: withUser(<TriviaGamePage />) },
        { path: 'juegos/memorama', element: withUser(<MemoryGamePage />) },
        { path: 'juegos/ahorcado', element: withUser(<HangmanGamePage />) },
        { path: 'juegos/rompecabezas', element: withUser(<PuzzleGamePage />) },
        { path: 'juegos/sopa-de-letras', element: withUser(<WordsearchGamePage />) },
        { path: 'juegos/crucigrama', element: withUser(<CrosswordGamePage />) },

        // Fase A
        { path: 'galeria', element: <GalleryPage /> },
        { path: 'libro-del-mes', element: <BookOfMonthPage /> },
        { path: 'insignias', element: <BadgesPage /> },

        // Fase B - con prop type
        { path: 'periodico', element: <PublicationPage type="PERIODICO" /> },
        { path: 'revista-digital', element: <PublicationPage type="REVISTA" /> },

        // Fase D
        { path: 'club-de-lectura/retos', element: <ReadingChallengesPage /> },

        // Fase F
        { path: 'foro', element: withUser(<ForumPage />) },
        { path: 'actividades', element: withUser(<ActivitiesPage />) },

        {
          path: 'admin',
          element: (
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          ),
        },
      ],
    },
    {
      path: '/ingresar',
      element: <LoginPage />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ],
  { future: { v7_startTransition: true } }
);