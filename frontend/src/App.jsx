import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { UserAuthProvider } from './context/UserAuthContext.jsx';
import { AchievementsProvider } from './context/AchievementsContext.jsx';
import { BooksProvider } from './context/BooksContext.jsx';
import { EventsProvider } from './context/EventsContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { router } from './router/index.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <UserAuthProvider>
          <AchievementsProvider>
            <BooksProvider>
              <EventsProvider>
                <ProfileProvider>
                  <RouterProvider router={router} />
                </ProfileProvider>
              </EventsProvider>
            </BooksProvider>
          </AchievementsProvider>
        </UserAuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}