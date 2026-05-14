import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { ActiveUserProvider } from './context/ActiveUserContext';
import { router } from './routes';

export default function App() {
  return (
    <ActiveUserProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#f0f0ff',
          },
        }}
      />
    </ActiveUserProvider>
  );
}
