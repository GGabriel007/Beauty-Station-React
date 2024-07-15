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
import Module_1Hair from './pages/Module_1Hair';
import Module_2Hair from './pages/Module_2Hair';
import Module_3Hair from './pages/Module_3Hair';
import Module_4Hair from './pages/Module_4Hair';
import Module_1Mkup from './pages/Module_1Mkup';
import Module_2Mkup from './pages/Module_2Mkup';
import Module_3Mkup from './pages/Module_3Mkup';
import Module_4Mkup from './pages/Module_4Mkup';
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
          <Routes basename= "/Beauty-Station-React">
            <Route path="/" element={<BeautyStation />} />
            <Route path="/classes" element={<BeautySClasses />} />
            <Route path="/servicio-a-domicilio" element={<BeautySDomicilio />} />
            <Route path="/nosotros" element={<BeautySContacto />} />
            <Route path ="/classes/classes-1" element = {<Classes1 />} />
            <Route path ="/classes/classes-2" element = {<Classes2 />} />
            <Route path ="/classes/classes-1/Module_1Hair" element = {<Module_1Hair />} />
            <Route path ="/classes/classes-1/Module_2Hair" element = {<Module_2Hair />} />
            <Route path ="/classes/classes-1/Module_3Hair" element = {<Module_3Hair />} />
            <Route path ="/classes/classes-1/Module_4Hair" element = {<Module_4Hair />} />
            <Route path ="/classes/classes-2/Module_1Mkup" element = {<Module_1Mkup />} />
            <Route path ="/classes/classes-2/Module_2Mkup" element = {<Module_2Mkup />} />
            <Route path ="/classes/classes-2/Module_3Mkup" element = {<Module_3Mkup />} />
            <Route path ="/classes/classes-2/Module_4Mkup" element = {<Module_4Mkup />} />
            
            <Route path="/cart" element ={<CartPage />} />
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
    <Link to = "/cart" className = "cart-button">
      🛒 {cartItems.length > 0 && <span>{cartItems.length}</span>}
    </Link>
  );
};

export default App;
