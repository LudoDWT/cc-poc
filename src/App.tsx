import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { EmptyState } from './components/ui';
// Pages chargées à la demande (code-splitting) + prefetch au survol : cf. src/lib/pages.ts.
import { Pages } from './lib/pages';

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
          <Route index element={<Pages.Overview />} />
          <Route path="timeline" element={<Pages.TimelinePage />} />
          <Route path="kpi" element={<Pages.KpiPage />} />
          <Route path="metiers" element={<Pages.Metiers />} />
          <Route path="metiers/:slug" element={<Pages.MetierDetail />} />
          <Route path="avant-apres" element={<Pages.AvantApresPage />} />
          <Route path="cas-usage" element={<Pages.CasUsagePage />} />
          <Route path="rex-interne" element={<Pages.RexInternePage />} />
          <Route path="rex" element={<Pages.RexPage />} />
          <Route path="rex/:id" element={<Pages.RexDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
