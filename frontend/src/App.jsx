import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { BooksProvider } from './context/BooksContext.jsx';
import { EventsProvider } from './context/EventsContext.jsx';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { router } from './router/index.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BooksProvider>
            <EventsProvider>
              <ProfileProvider>
                <RouterProvider router={router} />
              </ProfileProvider>
            </EventsProvider>
          </BooksProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
