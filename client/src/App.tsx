import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { RouteFallback } from '@/components/ui/RouteFallback';
import { AdminGuard } from '@/admin/AdminGuard';
import Home from '@/pages/Home';

// Everything but the landing page is code-split.
const Trips = lazy(() => import('@/pages/Trips'));
const TripDetail = lazy(() => import('@/pages/TripDetail'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AdminLogin = lazy(() => import('@/admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/admin/pages/AdminDashboard'));
const AdminTripForm = lazy(() => import('@/admin/pages/AdminTripForm'));

export default function App() {
  return (
    <SmoothScroll>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="trips" element={<Trips />} />
            <Route path="trips/:slug" element={<TripDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<AdminDashboard />} />
            <Route path="trips/new" element={<AdminTripForm mode="create" />} />
            <Route path="trips/:id/edit" element={<AdminTripForm mode="edit" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SmoothScroll>
  );
}
