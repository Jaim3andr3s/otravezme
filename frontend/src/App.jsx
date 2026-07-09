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
import { MascotProvider } from './context/MascotContext.jsx';
import { router } from './router/index.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <UserAuthProvider>
          <AchievementsProvider>
            <BooksProvider>
              <EventsProvider>
                <GalleryProvider>
                  <ArticlesProvider>
                    <ChallengesProvider>
                      <MascotProvider>
                        <ProfileProvider>
                          <RouterProvider router={router} />
                        </ProfileProvider>
                      </MascotProvider>
                    </ChallengesProvider>
                  </ArticlesProvider>
                </GalleryProvider>
              </EventsProvider>
            </BooksProvider>
          </AchievementsProvider>
        </UserAuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}