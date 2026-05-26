import { lazy, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { EmptyState } from './components/ui';

// Pages chargées à la demande (code-splitting) : seul le shell est dans le bundle
// initial, chaque route (et ses dépendances, ex. recharts) arrive dans son propre chunk.
const Overview = lazy(() => import('./pages/Overview'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const KpiPage = lazy(() => import('./pages/KpiPage'));
const Metiers = lazy(() => import('./pages/Metiers'));
const MetierDetail = lazy(() => import('./pages/MetierDetail'));
const AvantApresPage = lazy(() => import('./pages/AvantApresPage'));
const CasUsagePage = lazy(() => import('./pages/CasUsagePage'));
const RexPage = lazy(() => import('./pages/RexPage'));
const RexDetailPage = lazy(() => import('./pages/RexDetailPage'));
const RexInternePage = lazy(() => import('./pages/RexInternePage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <EmptyState>
      Page introuvable.{' '}
      <Link to="/" className="text-primary hover:underline">
        Retour à l'accueil
      </Link>
    </EmptyState>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="kpi" element={<KpiPage />} />
          <Route path="metiers" element={<Metiers />} />
          <Route path="metiers/:slug" element={<MetierDetail />} />
          <Route path="avant-apres" element={<AvantApresPage />} />
          <Route path="cas-usage" element={<CasUsagePage />} />
          <Route path="rex-interne" element={<RexInternePage />} />
          <Route path="rex" element={<RexPage />} />
          <Route path="rex/:id" element={<RexDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
