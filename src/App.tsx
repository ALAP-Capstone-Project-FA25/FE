import { Toaster } from './components/ui/toaster';
import AppProvider from './providers';
import AppRouter from './routes';
import GlobalUnviewedLessonsWidget from './components/lesson-recommendations/GlobalUnviewedLessonsWidget';

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
      <GlobalUnviewedLessonsWidget />
      <Toaster />
    </AppProvider>
  );
}
