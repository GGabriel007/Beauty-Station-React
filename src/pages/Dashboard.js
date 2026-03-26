import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
import '../styles/dashboard.css';

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
    return <div className="dashboard-loading-container">Cargando su cuenta...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Mi Perfil</h1>
    <div className="dashboard-container">

      <div className="dashboard-personal-info">
        <h2 className="dashboard-section-title">Datos Personales</h2>
        <p className="dashboard-text-item"><strong>Nombre:</strong> <span className="dashboard-text-capitalize">{displayName}</span></p>
        <p className="dashboard-text-item"><strong>Email registrado:</strong> {bestEmail}</p>
      </div>

      <div className="dashboard-courses-section">
        <h3 className="dashboard-courses-title">TUS CURSOS</h3>

        {loadingOrders ? (
          <p className="dashboard-loading-text">Buscando tu información de registro en AWS...</p>
        ) : orders.length > 0 ? (
          <div>
            {orders.map((order, idx) => (
              <div key={idx} className="dashboard-order-card">
                <div className="dashboard-order-header">
                  <p className="dashboard-order-header-text"><strong>COMPROBANTE NO:</strong> {order.id.split('-')[0].toUpperCase()}</p>
                  <p className="dashboard-order-header-text"><strong>FECHA:</strong> {new Date(order.Timestamp).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="dashboard-order-modules">
                  <p className="dashboard-modules-title">Módulos Reservados:</p>
                  <ul className="dashboard-modules-list">
                    {typeof order.Items === 'string' ? order.Items.split(',').map((mod, i) => {
                      const cleanName = mod.trim();
                      let courseSlug = null;
                      
                      // Explicitly exclude kits from getting a dynamic hyperlink
                      if (cleanName.toLowerCase().includes('kit')) courseSlug = null; 
                      else if (cleanName.toLowerCase().includes('peinados para eventos') || cleanName.toLowerCase().includes('peinado para eventos')) courseSlug = 'peinado-eventos';
                      else if (cleanName.toLowerCase().includes('master waves intensivo')) courseSlug = 'master-waves-intensivo';
                      else if (cleanName.toLowerCase().includes('master waves')) courseSlug = 'master-waves';
                      else if (cleanName.toLowerCase().includes('curso completo peinado')) courseSlug = 'curso-completo-peinado';
                      else if (cleanName.toLowerCase().includes('pieles perfectas')) courseSlug = 'pieles-perfectas';
                      else if (cleanName.toLowerCase().includes('maquillaje social')) courseSlug = 'maquillaje-social';
                      else if (cleanName.toLowerCase().includes('maestría en novias') && cleanName.toLowerCase().includes('makeup')) courseSlug = 'maestria-novias-makeup';
                      else if (cleanName.toLowerCase().includes('maestría en novias') || cleanName.toLowerCase().includes('maestrías en novias')) courseSlug = 'maestria-novias';
                      else if (cleanName.toLowerCase().includes('curso completo maquillaje')) courseSlug = 'curso-completo-maquillaje';

                      return (
                        <li key={i} className={courseSlug ? "dashboard-module-item" : "dashboard-module-item-compact"}>
                          <div className="dashboard-module-name">{cleanName}</div>
                          {courseSlug && (
                            <Link to={`/classes/course/${courseSlug}`} className="dashboard-module-link">
                              Más información sobre el curso
                            </Link>
                          )}
                        </li>
                      );
                    }) : null}
                  </ul>
                </div>

                <p className="dashboard-order-total"><strong>Total Cancelado:</strong> Q {order.TotalPrice}.00</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p className="dashboard-empty-text">Aún no has adquirido o completado el pago de ningún módulo oficial.</p>
            <button
              onClick={() => navigate('/classes')}
              className="dashboard-explore-button">
              Explorar cursos
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
