import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore} from './firebaseConfig.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './LoginPage.css';
import Model from './Model.js'; 
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();
  const [isModelOpen, setIsModelOpen] = useState(false); 

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const roleRef = doc(firestore, 'users', user.uid);
      const snapshot = await getDoc(roleRef);

      
      if (snapshot.exists()) {
        const userRole = snapshot.data().role;

      if (userRole === 'admin') {
        navigate('/admin');
        console.log('User role:', userRole);
      } else if (userRole === 'standarduser') {
        navigate('/userhomepage');
      } else if (userRole === 'moderator') {
        navigate('/moderatorhomepage');
      }

      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please try again.');
    }
    
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent. Please check your inbox.');
      setIsModelOpen(false); 
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email. Please try again.');
    }
  };

  const openModel = () => setIsModelOpen(true);
  const closeModel = () => setIsModelOpen(false);

  return (
    <div className="login-container">
      <div className="form-wrapper">
        <h1 className="text-center">Login</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-group">
            <button className="btn btn-primary login-btn" type="submit">Login</button>
            <button className="btn btn-link" type="button" onClick={openModel}>Forgot Password?</button>
          </div>
        </form>
      </div>

    
      <Model isOpen={isModelOpen} onClose={closeModel}>
        <h2>Reset Password</h2>
        <form onSubmit={handlePasswordReset}>
          <div className="input-group">
            <label htmlFor="resetEmail">Email:</label>
            <input
              type="email"
              id="resetEmail"
              name="resetEmail"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <button className=" reset-btn" type="submit">Send Reset Email</button>
        </form>
      </Model>
    </div>
  );
};

export default LoginPage;
