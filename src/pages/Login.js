import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const navigate = useNavigate();

  // If the user is already authenticated, redirect them to the Cart immediately
  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/cart');
    }
  }, [authStatus, navigate]);

  return (
    <div className="login-container">
      {/* This simple, pre-built component handles Sign-Up, Sign-In, and Password Resets automatically! */}
      {/* We pass the 'google' provider flag to automatically render the "Sign In With Google" button! */}
      <Authenticator socialProviders={['google']} />
    </div>
  );
};

export default Login;
