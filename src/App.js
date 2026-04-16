// src/App.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Hub } from 'aws-amplify/utils';
import { get } from 'aws-amplify/api';
import { toast } from 'react-toastify';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BeautyStation from './pages/BeautyStation';
import BeautySDomicilio from './pages/BeautySDomicilio';
import BeautySClasses from './pages/BeautySClasses';
import BeautySContacto from './pages/BeautySContacto';
import Classes1 from './pages/Classes_1';
import Classes2 from './pages/Classes_2';
import CourseDetails from './components/CourseDetails';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import { CartProvider, CartContext } from './context/CartContext';
import { CourseDataProvider } from './context/CourseDataContext';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <CartProvider>
      <CourseDataProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppLayout />
        </Router>
      </CourseDataProvider>
    </CartProvider>
  );
}

// Inner layout — must live inside <Router> so useLocation is available.
// The admin panel gets its own full-page shell; all site chrome is hidden there.
function AppLayout() {
  const location = useLocation();
  const isAdmin       = location.pathname === '/admin';
  const isStaffLogin  = location.pathname === '/staff-login';

  return (
    <div className="App">
      {!isAdmin && <Header />}
      {!isAdmin && !isStaffLogin && <SiteNoticeBanner />}
      <Routes basename="/Beauty-Station-React">
        <Route path="/" element={<BeautyStation />} />
        <Route path="/classes" element={<BeautySClasses />} />
        <Route path="/servicio-a-domicilio" element={<BeautySDomicilio />} />
        <Route path="/nosotros" element={<BeautySContacto />} />
        <Route path="/classes/classes-1" element={<Classes1 />} />
        <Route path="/classes/classes-2" element={<Classes2 />} />
        <Route path="/classes/course/:courseId" element={<CourseDetails />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mis-cursos/:courseId" element={<CoursePlayer />} />

        {/* Admin panel — protected by AdminPage */}
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <AuthRedirectHandler />
      <AuthRouteWatcher />
      {!isAdmin && !isStaffLogin && <CartButton />}
      {!isAdmin && <Footer />}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

// ─── Handles post-auth redirects and login/logout toasts ──────────────────────
// Uses Amplify Hub so it fires for BOTH email sign-in AND Google OAuth.
// Hub fires 'signedIn' on actual logins only (not on page refreshes, which
// fire 'tokenRefresh' instead), so toasts never appear on reload.
const AuthRedirectHandler = () => {
  const navigate = useNavigate();

  // ── OAuth sign-out: after Google redirects back the app remounts fresh.
  // The Hub 'signedOut' event may not fire in that case, so we check the
  // sessionStorage flag set by Header's confirm handler on every cold mount.
  useEffect(() => {
    if (sessionStorage.getItem('showLogoutToast')) {
      sessionStorage.removeItem('showLogoutToast');
      toast.success('¡Has cerrado sesión exitosamente! ¡Hasta pronto!', { autoClose: 3000 });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        // StaffLogin handles its own group-check redirect — don't interfere.
        if (sessionStorage.getItem('staffLogin')) return;
        toast.success('¡Bienvenido/a! Has iniciado sesión exitosamente.', { autoClose: 3000 });
        const redirect = sessionStorage.getItem('loginRedirect') || '/classes';
        sessionStorage.removeItem('loginRedirect');
        navigate(redirect, { replace: true });
      } else if (payload.event === 'signedOut') {
        // Local account sign-out: Hub fires synchronously, handle here.
        // OAuth sign-out: page already redirected so this branch won't run;
        // the mount-time useEffect above handles the toast instead.
        if (sessionStorage.getItem('showLogoutToast')) {
          sessionStorage.removeItem('showLogoutToast');
          toast.success('¡Has cerrado sesión exitosamente! ¡Hasta pronto!', { autoClose: 3000 });
        }
        navigate('/', { replace: true });
      } else if (payload.event === 'tokenRefresh_failure') {
        toast.warn('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', { autoClose: 5000 });
        navigate('/login', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return null;
};

// ─── Watches Authenticator UI route transitions for sign-up / password-reset toasts
// route transitions only fire while the <Authenticator> is mounted (i.e. /login page).
// Authenticator.Provider in index.js makes useAuthenticator available everywhere.
const AuthRouteWatcher = () => {
  const { route } = useAuthenticator(context => [context.route]);
  const prevRoute = useRef(null);

  useEffect(() => {
    const prev = prevRoute.current;
    prevRoute.current = route;

    if (prev === 'signUp' && route === 'confirmSignUp') {
      toast.info('¡Cuenta creada! Revisa tu correo para confirmar tu registro.', { autoClose: 5000 });
    } else if (prev === 'forgotPassword' && route === 'confirmResetPassword') {
      toast.info('Te hemos enviado un código a tu correo electrónico.', { autoClose: 5000 });
    } else if (prev === 'confirmResetPassword' && route === 'signIn') {
      toast.success('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.', { autoClose: 4000 });
    }
  }, [route]);

  return null;
};

// ─── Site notice banner ────────────────────────────────────────────────────────
// Fetches /site-settings once and shows a dismissible top-of-page banner
// when siteNoticeActive is true. Silently hidden if the fetch fails.
const SiteNoticeBanner = () => {
  const [notice,    setNotice]    = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const op = get({ apiName: 'checkoutApi', path: '/site-settings' });
        const { body } = await op.response;
        const data = await body.json();
        if (data.siteNoticeActive === true || data.siteNoticeActive === 'true') {
          setNotice(data.siteNotice || '');
        }
      } catch {
        // non-critical — fail silently
      }
    };
    load();
  }, []);

  if (!notice || dismissed) return null;

  return (
    <div style={{
      background: '#7D4E61', color: '#fff',
      padding: '10px 48px 10px 20px',
      textAlign: 'center',
      fontSize: '0.88rem',
      fontFamily: "'Montserrat', sans-serif",
      position: 'relative',
      lineHeight: 1.5,
    }}>
      {notice}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso"
        style={{
          position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
          fontSize: '1.2rem', lineHeight: 1, padding: '2px 6px', opacity: 0.8,
        }}
      >×</button>
    </div>
  );
};

const CartButton = () => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <a href="/cart" className="cart-button" onClick={(e) => { e.preventDefault(); navigate('/cart'); }}>
      🛒 {cartItems.length > 0 && <span>{cartItems.length}</span>}
    </a>
  );
};

export default App;