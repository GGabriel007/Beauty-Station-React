import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';

const Dashboard = () => {
  const { user, authStatus } = useAuthenticator(context => [context.user, context.authStatus]);
  const navigate = useNavigate();
  const [userAttributes, setUserAttributes] = useState({});
  const [jwtName, setJwtName] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/login');
    } else if (authStatus === 'authenticated') {
      // 1. Fetch AWS Cognito attributes (only contains what was strictly mapped)
      fetchUserAttributes()
        .then((attributes) => setUserAttributes(attributes))
        .catch((error) => console.log('Error fetching user attributes:', error));

      // 2. Extract raw Google identity claims directly from the JWT ID Token Security payload!
      fetchAuthSession()
        .then((session) => {
          const idTokenPayload = session?.tokens?.idToken?.payload;
          if (idTokenPayload) {
             setJwtName(idTokenPayload.name || idTokenPayload.given_name || '');
          }
        })
        .catch((error) => console.log('Error fetching session tokens:', error));
    }
  }, [authStatus, navigate]);

  // Priority: 1. Raw Authentication Token Name -> 2. AWS Profile Name -> 3. Email -> 4. Account ID
  const displayName = jwtName || userAttributes.name || userAttributes.given_name || userAttributes.email || user?.signInDetails?.loginId || user?.username || 'Usuario';
  const bestEmail = userAttributes.email || user?.signInDetails?.loginId || '';

  useEffect(() => {
    if (authStatus === 'authenticated' && bestEmail) {
      setLoadingOrders(true);
      const restOperation = get({
        apiName: 'checkoutApi',
        path: `/my-orders?email=${encodeURIComponent(bestEmail)}`
      });
      restOperation.response
        .then(response => response.body.json())
        .then(data => {
            setOrders(data);
            setLoadingOrders(false);
        })
        .catch(err => {
            console.error("Error loading user orders", err);
            setLoadingOrders(false);
        });
    }
  }, [authStatus, bestEmail]);

  if (authStatus !== 'authenticated') {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando su cuenta...</div>;
  }

  // Gracefully extract just the first name if they have a long full name
  const firstName = displayName.split(' ')[0];

  return (
    <div style={{ padding: '50px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '28px', color: '#111', borderBottom: '2px solid black', paddingBottom: '10px' }}>Mi Perfil</h1>
      
      <div style={{ background: 'white', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
         <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>Datos Personales</h2>
         <p style={{ margin: '5px 0' }}><strong>Nombre:</strong> <span style={{ textTransform: 'capitalize' }}>{displayName}</span></p>
         <p style={{ margin: '5px 0' }}><strong>Email registrado:</strong> {bestEmail}</p>
      </div>
      
      <div style={{ background: '#f9f9f9', border: '1px solid #ddd', padding: '25px', borderRadius: '8px', marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>TUS CURSOS</h3>
        
        {loadingOrders ? (
          <p style={{ color: '#555' }}>Buscando tu información de registro en AWS...</p>
        ) : orders.length > 0 ? (
          <div>
             {orders.map((order, idx) => (
                <div key={idx} style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '15px', borderLeft: '4px solid #000', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap' }}>
                     <p style={{ margin: '0', fontSize: '14px', color: '#777' }}><strong>COMPROBANTE NO:</strong> {order.id.split('-')[0].toUpperCase()}</p>
                     <p style={{ margin: '0', fontSize: '14px', color: '#777' }}><strong>FECHA:</strong> {new Date(order.Timestamp).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                   </div>
                   
                   <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                     <p style={{ margin: '10px 0 5px 0', fontWeight: 'bold' }}>Módulos Reservados:</p>
                     <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                       {typeof order.Items === 'string' ? order.Items.split(',').map((mod, i) => {
                          const cleanName = mod.trim();
                          let courseSlug = null;
                          if (cleanName.toLowerCase().includes('peinados para eventos') || cleanName.toLowerCase().includes('peinado para eventos')) courseSlug = 'peinado-eventos';
                          else if (cleanName.toLowerCase().includes('master waves intensivo')) courseSlug = 'master-waves-intensivo';
                          else if (cleanName.toLowerCase().includes('master waves')) courseSlug = 'master-waves';
                          else if (cleanName.toLowerCase().includes('curso completo peinado')) courseSlug = 'curso-completo-peinado';
                          else if (cleanName.toLowerCase().includes('pieles perfectas')) courseSlug = 'pieles-perfectas';
                          else if (cleanName.toLowerCase().includes('maquillaje social')) courseSlug = 'maquillaje-social';
                          else if (cleanName.toLowerCase().includes('maestría en novias') && cleanName.toLowerCase().includes('makeup')) courseSlug = 'maestria-novias-makeup';
                          else if (cleanName.toLowerCase().includes('maestría en novias') || cleanName.toLowerCase().includes('maestrías en novias')) courseSlug = 'maestria-novias';
                          else if (cleanName.toLowerCase().includes('curso completo maquillaje')) courseSlug = 'curso-completo-maquillaje';
                          
                          return (
                            <li key={i} style={{ marginBottom: courseSlug ? '15px' : '5px' }}>
                              <div style={{ fontWeight: '500', color: '#111' }}>{cleanName}</div>
                              {courseSlug && (
                                <Link to={`/classes/course/${courseSlug}`} style={{ fontSize: '13px', color: '#555', textDecoration: 'underline', marginTop: '3px', display: 'inline-block' }}>
                                  Más información sobre el curso
                                </Link>
                              )}
                            </li>
                          );
                       }) : null}
                     </ul>
                   </div>
                   
                   <p style={{ margin: '0', textAlign: 'right', fontSize: '18px' }}><strong>Total Cancelado:</strong> Q {order.TotalPrice}.00</p>
                </div>
             ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
             <p style={{ fontSize: '16px', color: '#555', marginBottom: '15px' }}>Aún no has adquirido o completado el pago de ningún módulo oficial.</p>
             <button 
               onClick={() => navigate('/classes')} 
               style={{ padding: '12px 24px', background: 'black', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}>
               Explorar cursos
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
