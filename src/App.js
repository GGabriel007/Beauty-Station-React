// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
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
import CartPage from './pages/CartPage'; // Adjust the import path if necessary
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { CartProvider, CartContext } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes basename="/Beauty-Station-React">
            <Route path="/" element={<BeautyStation />} />
            <Route path="/classes" element={<BeautySClasses />} />
            <Route path="/servicio-a-domicilio" element={<BeautySDomicilio />} />
            <Route path="/nosotros" element={<BeautySContacto />} />
            <Route path="/classes/classes-1" element={<Classes1 />} />
            <Route path="/classes/classes-2" element={<Classes2 />} />
            <Route path="/classes/course/:courseId" element={<CourseDetails />} />

            {/* Added Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/cart" element={<CartPage />} />
          </Routes>
          <CartButton />
          <Footer />
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
      </Router>
    </CartProvider>
  );
}

const CartButton = () => {
  const { cartItems } = useContext(CartContext);
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (authStatus !== 'authenticated') {
      sessionStorage.setItem('loginRedirect', '/classes');
      toast.warn('¡Inicia sesión para ver tu carrito!', {
        onClick: () => navigate('/login'),
        style: { cursor: 'pointer' },
      });
      navigate('/login');
      return;
    }
    navigate('/cart');
  };

  return (
    <a href="/cart" className="cart-button" onClick={handleClick}>
      🛒 {cartItems.length > 0 && <span>{cartItems.length}</span>}
    </a>
  );
};

export default App;