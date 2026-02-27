// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/App.css';
import BeautyStation from './pages/BeautyStation';
import BeautySDomicilio from './pages/BeautySDomicilio';
import BeautySClasses from './pages/BeautySClasses';
import BeautySContacto from './pages/BeautySContacto';
import Classes1 from './pages/Classes_1';
import Classes2 from './pages/Classes_2';
import CourseDetails from './components/CourseDetails';
import CartPage from './pages/CartPage'; // Adjust the import path if necessary
import { CartProvider, CartContext } from './context/CartContext';
import { SeatProvider } from './context/SeatContext';
function App() {

  return (
    <SeatProvider >
      <CartProvider>
        <Router>
          <div className="App" style={{ backgroundColor: 'white', minHeight: '100vh' }}>
            <Header />
            <Routes basename="/Beauty-Station-React">
              <Route path="/" element={<BeautyStation />} />
              <Route path="/classes" element={<BeautySClasses />} />
              <Route path="/servicio-a-domicilio" element={<BeautySDomicilio />} />
              <Route path="/nosotros" element={<BeautySContacto />} />
              <Route path="/classes/classes-1" element={<Classes1 />} />
              <Route path="/classes/classes-2" element={<Classes2 />} />
              <Route path="/classes/course/:courseId" element={<CourseDetails />} />

              <Route path="/cart" element={<CartPage />} />
            </Routes>
            <CartButton />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </SeatProvider>
  );
}

const CartButton = () => {
  const { cartItems } = useContext(CartContext); // Access cartItems from context 


  return (


    <Link to="/cart" className="cart-button">
      🛒 {cartItems.length > 0 && <span>{cartItems.length}</span>}
    </Link>

  );
};

export default App;