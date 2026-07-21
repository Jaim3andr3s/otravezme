import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { UserAuthProvider } from './context/UserAuthContext.jsx';
import { AchievementsProvider } from './context/AchievementsContext.jsx';
import { BooksProvider } from './context/BooksContext.jsx';
import { EventsProvider } from './context/EventsContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { GalleryProvider } from './context/GalleryContext.jsx';
import { ArticlesProvider } from './context/ArticlesContext.jsx';
import { ChallengesProvider } from './context/ChallengesContext.jsx';
import { ForumProvider } from './context/ForumContext.jsx';
import { ActivitiesProvider } from './context/ActivitiesContext.jsx';
import { MascotProvider } from './context/MascotContext.jsx';
import { ComposeProviders } from './utils/composeProviders.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { router } from './router/index.jsx';

const providers = [
  ThemeProvider,
  NotificationProvider,
  UserAuthProvider,
  AchievementsProvider,
  BooksProvider,
  EventsProvider,
  GalleryProvider,
  ArticlesProvider,
  ChallengesProvider,
  ForumProvider,
  ActivitiesProvider,
  MascotProvider,
  ProfileProvider,
];

export default function App() {
  return (
    <ErrorBoundary>
      <ComposeProviders providers={providers}>
        <RouterProvider router={router} />
      </ComposeProviders>
    </ErrorBoundary>
  );
}
