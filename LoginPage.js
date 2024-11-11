import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLinks from './PortalLinks';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Basic regex for email validation
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Reset error state
    setError('');

    // Validate email and password fields
    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Mock login (API call or authentication check would go here)
    console.log('Logging in with:', email, password);

    // Redirect to user dashboard or homepage after login
    navigate('/admins');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Redirect to forgot password page
    navigate('/forgot-password');
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // Redirect to signup page
    navigate('/');
  };

  return (
    <div className="login-container">
      <h1 className="site-title">EVENTOPIA</h1>
      <PortalLinks />

      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="login-links">
          <a href="/forgot-password" onClick={handleForgotPassword}>Forgot Password?</a> |
          <a href="/signup" onClick={handleSignUp}>New here?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
