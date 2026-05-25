import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { EmptyState } from './components/ui';
import Overview from './pages/Overview';
import TimelinePage from './pages/TimelinePage';
import KpiPage from './pages/KpiPage';
import Metiers from './pages/Metiers';
import MetierDetail from './pages/MetierDetail';
import AvantApresPage from './pages/AvantApresPage';
import CasUsagePage from './pages/CasUsagePage';
import RexPage from './pages/RexPage';
import RexInternePage from './pages/RexInternePage';

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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
