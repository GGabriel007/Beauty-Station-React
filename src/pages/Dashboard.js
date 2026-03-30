import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserAttributes, fetchAuthSession, updateUserAttributes } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user, authStatus } = useAuthenticator(context => [context.user, context.authStatus]);
  const navigate = useNavigate();
  const [userAttributes, setUserAttributes] = useState({});
  const [jwtName, setJwtName] = useState('');
  const [overrideName, setOverrideName] = useState(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [updateNameLoading, setUpdateNameLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/login');
    } else if (authStatus === 'authenticated') {
      fetchUserAttributes()
        .then((attributes) => setUserAttributes(attributes))
        .catch((error) => console.log('Error fetching user attributes:', error));

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

  const displayName = overrideName || jwtName || userAttributes.name || userAttributes.given_name || userAttributes.email || user?.signInDetails?.loginId || user?.username || '';
  const bestEmail = userAttributes.email || user?.signInDetails?.loginId || '';

  const handleEditName = () => {
    setEditNameValue(displayName);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditNameValue('');
  };

  const handleSaveName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed) return;
    setUpdateNameLoading(true);
    try {
      await updateUserAttributes({ userAttributes: { name: trimmed } });
      setOverrideName(trimmed);
      setUserAttributes(prev => ({ ...prev, name: trimmed }));
      setIsEditingName(false);
      toast.success('Nombre actualizado correctamente.', { autoClose: 3000 });
    } catch (err) {
      toast.error('No se pudo actualizar el nombre. Intenta de nuevo.', { autoClose: 4000 });
    } finally {
      setUpdateNameLoading(false);
    }
  };

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

        {/* ── Personal info card ── */}
        <div className="dashboard-card">
          <p className="dashboard-card-label">Perfil</p>

          {/* Name row */}
          <div className="dashboard-info-row">
            <span className="dashboard-info-key">Nombre</span>
            {isEditingName ? (
              <div className="dashboard-name-edit">
                <input
                  className="dashboard-name-input"
                  type="text"
                  value={editNameValue}
                  onChange={e => setEditNameValue(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 60))}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit(); }}
                  autoFocus
                  maxLength={60}
                />
                <button className="dashboard-edit-action save" onClick={handleSaveName} disabled={updateNameLoading} title="Guardar">
                  <FiCheck />
                </button>
                <button className="dashboard-edit-action cancel" onClick={handleCancelEdit} title="Cancelar">
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="dashboard-info-value-row">
                <span className="dashboard-info-value">{displayName || '—'}</span>
                <button className="dashboard-edit-btn" onClick={handleEditName} title="Editar nombre">
                  <FiEdit2 />
                </button>
              </div>
            )}
          </div>

          <div className="dashboard-info-divider" />

          {/* Email row */}
          <div className="dashboard-info-row">
            <span className="dashboard-info-key">Email</span>
            <span className="dashboard-info-value">{bestEmail}</span>
          </div>
        </div>

        {/* ── Orders card ── */}
        <div className="dashboard-card">
          <p className="dashboard-card-label">Tus Cursos</p>

          {loadingOrders ? (
            <p className="dashboard-loading-text">Buscando tus registros...</p>
          ) : orders.length > 0 ? (
            <div className="dashboard-orders-list">
              {orders.map((order, idx) => (
                <div key={idx} className="dashboard-order-card">
                  <div className="dashboard-order-header">
                    <span className="dashboard-order-id">#{order.id.split('-')[0].toUpperCase()}</span>
                    <span className="dashboard-order-date">
                      {new Date(order.Timestamp).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  <ul className="dashboard-modules-list">
                    {typeof order.Items === 'string' ? order.Items.split(',').map((mod, i) => {
                      const cleanName = mod.trim();
                      let courseSlug = null;

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
                        <li key={i} className="dashboard-module-item">
                          <span className="dashboard-module-dot" />
                          <div className="dashboard-module-body">
                            <span className="dashboard-module-name">{cleanName}</span>
                            {courseSlug && (
                              <Link to={`/classes/course/${courseSlug}`} className="dashboard-module-link">
                                Ver curso →
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    }) : null}
                  </ul>

                  <div className="dashboard-order-footer">
                    <span className="dashboard-order-total-label">Total cancelado</span>
                    <span className="dashboard-order-total-value">Q {order.TotalPrice}.00</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <p className="dashboard-empty-text">Aún no tienes cursos registrados.</p>
              <button onClick={() => navigate('/classes')} className="dashboard-explore-button">
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
