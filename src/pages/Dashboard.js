import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

const Dashboard = () => {
  const { user, authStatus } = useAuthenticator(context => [context.user, context.authStatus]);
  const navigate = useNavigate();
  const [userAttributes, setUserAttributes] = useState({});
  const [jwtName, setJwtName] = useState('');

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
             console.log("Token Claims Retrieved:", idTokenPayload);
             setJwtName(idTokenPayload.name || idTokenPayload.given_name || '');
          }
        })
        .catch((error) => console.log('Error fetching session tokens:', error));
    }
  }, [authStatus, navigate]);

  if (authStatus !== 'authenticated') {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando su cuenta...</div>;
  }

  // Priority: 1. Raw Authentication Token Name -> 2. AWS Profile Name -> 3. Email -> 4. Account ID
  const displayName = jwtName || userAttributes.name || userAttributes.given_name || userAttributes.email || user?.signInDetails?.loginId || user?.username || 'Usuario';

  // Gracefully extract just the first name if they have a long full name
  const firstName = displayName.split(' ')[0];

  return (
    <div style={{ padding: '50px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1>Mi Panel de Control</h1>
      
      <p>Bienvenido, <strong style={{ textTransform: 'capitalize' }}>{firstName}</strong>!</p>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Tus Cursos / Eventos</h3>
        <p>Aún no has comprado ningún curso.</p>
        <button 
          onClick={() => navigate('/classes')} 
          style={{ padding: '10px 20px', background: 'black', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
          Explorar clases
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
