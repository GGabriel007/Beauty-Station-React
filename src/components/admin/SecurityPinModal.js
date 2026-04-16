// src/components/admin/SecurityPinModal.js
import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';

const FONT = "'Montserrat', sans-serif";

export default function SecurityPinModal({ isOpen, onClose, onSuccess, message }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the current saved PIN from DB lazily when modal opens.
  // We don't cache it forever so that if another admin changes it, it's fresh.
  const verifyPin = async () => {
    if (!pin) return;
    setLoading(true);
    setError('');
    try {
      const op = get({ apiName: 'checkoutApi', path: '/admin/site-settings' });
      const { body } = await op.response;
      const settings = await body.json();
      
      const pinSetting = settings.find(s => s.settingKey === 'adminPin');
      // If no PIN has been set yet, we default to '1234'
      const correctPin = pinSetting?.value ?? '1234';

      if (pin === correctPin) {
        onSuccess();
        setPin(''); // Reset
      } else {
        setError('PIN incorrecto. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Error verificando PIN. Reintenta.');
    } finally {
      setLoading(false);
    }
  };

  // Close with Esc or Enter
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        setPin('');
      }
      if (e.key === 'Enter') {
        verifyPin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(3px)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: '32px 28px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h2 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontFamily: FONT, letterSpacing: '1px' }}>Validación de Seguridad</h2>
        <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#555', fontFamily: FONT, lineHeight: 1.5 }}>
          {message || 'Esta acción modifica datos financieros. Ingresa tu PIN de seguridad para continuar.'}
        </p>

        <input 
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Ej. 1234"
          autoFocus
          style={{
            width: '180px',
            padding: '12px',
            fontSize: '1.4rem',
            textAlign: 'center',
            letterSpacing: '8px',
            fontFamily: FONT,
            outline: 'none',
            border: '2px solid #ddd',
            transition: 'border-color 0.2s',
            marginBottom: '16px',
            boxSizing: 'border-box'
          }}
        />

        {error && <p style={{ color: '#c62828', fontSize: '0.75rem', fontFamily: FONT, margin: '0 0 16px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={() => { setPin(''); onClose(); }}
            style={{ flex: 1, padding: '10px 0', border: '1px solid #aaa', background: 'none', color: '#333', fontSize: '0.8rem', fontFamily: FONT, cursor: 'pointer', fontWeight: 600 }}
          >
            Cancelar
          </button>
          <button 
            onClick={verifyPin}
            disabled={loading || !pin}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: loading ? '#666' : '#111', color: '#fff', fontSize: '0.8rem', fontFamily: FONT, cursor: loading ? 'default' : 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
          >
            {loading ? 'Verificando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
