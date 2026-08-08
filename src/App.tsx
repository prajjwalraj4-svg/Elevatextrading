import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MarketTicker } from '@/components/MarketTicker';
import { BackToTop } from '@/components/BackToTop';
import { LoadingScreen } from '@/components/Loading';

import { HomePage } from '@/pages/HomePage';
import { MarketsPage } from '@/pages/MarketsPage';
import { PairPage } from '@/pages/PairPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AIAnalysisPage } from '@/pages/AIAnalysisPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { LoginPage, ForgotPasswordPage } from '@/pages/AuthPages';
import { ProfilePage } from '@/pages/ProfilePage';
import { PricingPage } from '@/pages/PricingPage';
import { BlogPage, BlogArticlePage } from '@/pages/BlogPage';
import { ContactPage } from '@/pages/ContactPage';
import { LegalPage } from '@/pages/LegalPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { JournalPage } from '@/pages/JournalPage';
import { PerformancePage } from '@/pages/PerformancePage';

function Router() {
  const { path } = useRouter();

  // Routes without navbar/footer
  const bareRoutes = ['/login', '/register', '/forgot-password', '/admin-login'];
  const isBare = bareRoutes.includes(path);

  const renderPage = () => {
    if (path === '/' || path === '') return <HomePage />;
    if (path === '/markets') return <MarketsPage />;
    if (path.startsWith('/pair/')) return <PairPage symbol={path.replace('/pair/', '')} />;
    if (path === '/analysis') return <AnalysisPage />;
    if (path === '/dashboard') return <DashboardPage />;
    if (path === '/ai-analysis') return <AIAnalysisPage />;
    if (path === '/calendar') return <CalendarPage />;
    if (path === '/login' || path === '/register') return <LoginPage />;
    if (path === '/forgot-password') return <ForgotPasswordPage />;
    if (path === '/profile') return <ProfilePage />;
    if (path === '/pricing') return <PricingPage />;
    if (path === '/blog') return <BlogPage />;
    if (path.startsWith('/blog/')) return <BlogArticlePage slug={path.replace('/blog/', '')} />;
    if (path === '/contact') return <ContactPage />;
    if (path.startsWith('/legal/')) return <LegalPage type={path.replace('/legal/', '')} />;
    if (path === '/admin-login') return <AdminLoginPage />;
    if (path === '/admin') return <AdminPage />;
    if (path === '/journal') return <JournalPage />;
    if (path === '/performance') return <PerformancePage />;
    return <HomePage />;
  };

  if (isBare) {
    return <div className="min-h-screen">{renderPage()}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <MarketTicker />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
