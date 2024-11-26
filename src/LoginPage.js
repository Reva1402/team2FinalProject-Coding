import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import './LoginPage.css';
import Model from './Model.js';
import { doc, getDoc } from 'firebase/firestore';
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();
  const [isModelOpen, setIsModelOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('loginpage-body');
    return () => {
      document.body.classList.remove('loginpage-body');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const roleRef = doc(firestore, 'users', user.uid);
      const snapshot = await getDoc(roleRef);

      if (snapshot.exists()) {
        const userData = snapshot.data();
        const userRole = userData.role;
        const userStatus = userData.status;

        if (userStatus !== 'suspended') {
          console.log('User status:', userStatus);
        } else {
          alert('Your account has been suspended. Please contact support.');
          setEmail('');
          setPassword('');
          await signOut(auth);
          return;
        }

        if (userRole === 'admin') {
          navigate('/AdminDashboard');
        } else if (userRole === 'standarduser' || userRole === 'user') {
          navigate('/userhomepage');
        } else if (userRole === 'moderator') {
          navigate('/ModeratorHomePage');
        }
      } else {
        alert('No User found, please register');
        navigate('/');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
      setEmail('');
      setPassword('');
      navigate('/login');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent. Please check your inbox.');
      setIsModelOpen(false);
    } catch (error) {
      alert('Failed to send password reset email. Please try again.');
    }
  };

  const openModel = () => setIsModelOpen(true);
  const closeModel = () => setIsModelOpen(false);

  return (
    <div className="loginpage-container">
      <nav className="loginpage-navbar">
        <div className="loginpage-navbar-brand" onClick={() => navigate('/')}>Eventopia</div>
        <ul className="loginpage-nav-links">
          <li className="loginpage-nav-item" onClick={() => navigate('/services')}>Services</li>
         <li><button className="btnLink">
                        <i className="fas fa-phone" style={{ marginRight: '10px' }}></i>
                        +1 123 456 789
                    </button></li>
          <a className="loginpage-logout-btn" onClick={() => navigate('/')}>Signup</a>
        </ul>
      </nav>


      <div className="loginpage-form-wrapper">
        <h1 className="loginpage-text-center">Login</h1>
        <form onSubmit={handleLogin} className="loginpage-form">
          <div className="loginpage-form-group">
            <label className="loginpage-label">Email:</label>
            <input
              type="email"
              id="email"
              className="loginpage-form-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="loginpage-form-group">
            <label  className="loginpage-label">Password:</label>
            <input
              type="password"
              id="password"
              className="loginpage-form-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="loginpage-button-group">
            <button className="loginpage-btn loginpage-btn-primary" type="submit">Login</button>
            <button className="loginpage-btn loginpage-btn-link" type="button" onClick={() => navigate('/')}>New here?</button>
            <button className="loginpage-btn loginpage-btn-link" type="button" onClick={openModel}>Forgot Password?</button>
          </div>
        </form>
      </div>

      <Model isOpen={isModelOpen} onClose={closeModel}>
        <h2 className="loginpage-reset-title">Reset Password</h2>
        <form onSubmit={handlePasswordReset} className="loginpage-reset-form">
          <div className="loginpage-input-group">
            <label htmlFor="resetEmail" className="loginpage-label">Email:</label>
            <input
              type="email"
              id="resetEmail"
              name="resetEmail"
              className="loginpage-form-control"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <button className="loginpage-reset-btn" type="submit">Send Reset Email</button>
        </form>
      </Model>
      <footer className="loginpage-footer">
        <ul className="loginpage-footer-links">
          <li className="loginpage-footer-link" onClick={() => navigate('/about')}>About</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
    </div>
  );
};

export default LoginPage;
