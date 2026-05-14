import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { SeriesListPage } from './pages/SeriesListPage';
import { SeriesFormPage } from './pages/SeriesFormPage';
import { SeriesDetailPage } from './pages/SeriesDetailPage';
import { SeasonDetailPage } from './pages/SeasonDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';

function Root() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
  },
  {
    path: '/users',
    element: (
      <Layout>
        <UsersPage />
      </Layout>
    ),
  },
  {
    path: '/series',
    element: (
      <Layout>
        <SeriesListPage />
      </Layout>
    ),
  },
  {
    path: '/series/new',
    element: (
      <Layout>
        <SeriesFormPage />
      </Layout>
    ),
  },
  {
    path: '/series/:seriesId',
    element: (
      <Layout>
        <SeriesDetailPage />
      </Layout>
    ),
  },
  {
    path: '/series/:seriesId/edit',
    element: (
      <Layout>
        <SeriesFormPage />
      </Layout>
    ),
  },
  {
    path: '/seasons/:seasonId',
    element: (
      <Layout>
        <SeasonDetailPage />
      </Layout>
    ),
  },
  {
    path: '/history',
    element: (
      <Layout>
        <HistoryPage />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <NotFoundPage />
      </Layout>
    ),
  },
]);
