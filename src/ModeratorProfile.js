import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, onSnapshot, getDoc, deleteDoc , } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './ModeratorProfile.css';
import './ModeratorUserManagement.css';

const ModeratorProfile = () => {
  const [moderatorProfile, setModeratorProfile] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [error, setError] = useState('');
  const [moderatorName, setModeratorName] = useState('');
  const [userName , setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      setUserName(user.firstName);
      
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setModeratorProfile(docSnap.data());
        } else {
          console.log('No such user document!');
          setError('Moderator profile not found.');
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setModeratorProfile(null); 
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const handleEditProfile = () => {
    navigate('/moderatoreditprofile');
  };

  const handleDeleteProfile = async () => {
    try {
      const isConfirmed = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.');
      if (isConfirmed && user) {
        const userRef = doc(firestore, 'users', user.uid);
        await deleteDoc(userRef);
        alert('Profile deleted successfully!');
        await signOut(auth); 
        navigate('/'); 
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile. Please try again later.');
    }
  };

  return (
    <div>
      <div className="moderator-management-container">
        <nav className="moderator-navbar">
                <h2>Welcome, Moderator</h2>
                
                <button className="profile-button" onClick={() => navigate('/ModeratorProfile')}>Profile</button>
                <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
            </nav>

        
           
                <aside className="sidebar">
                    <Link to="/moderatordashboard">Dashboard</Link>
                    <Link to="/ModeratorHomePage">Feed</Link>
                    <Link to="/ModeratorUserManagement">User Management</Link>
                    <Link to="/ModeratorEventManagement">Event Management</Link>
                    <Link to="/ModeratorCommentManagement">Comment Management</Link>
                </aside>

      <div className="profile-container">
        {moderatorProfile ? (
          <div className="profile-wrapper">
            <h1 className="profile-header">Moderator Profile</h1>
            <div className="profile-details">
              <div className="profile-picture">
                <img
                  src={moderatorProfile.profilePicture || 'default-profile.png'}
                  alt="Profile"
                  className="profile-img"
                />
              </div>
              <div className="profile-info">
                <p><strong>First Name:</strong> {moderatorProfile.firstName}</p>
                <p><strong>Last Name:</strong> {moderatorProfile.lastName}</p>
                <p><strong>Email:</strong> {moderatorProfile.email}</p>
                <p><strong>Phone Number:</strong> {moderatorProfile.phoneNumber}</p>
                <p><strong>Role:</strong> {moderatorProfile.role}</p>
                <p><strong>Join Date:</strong> {moderatorProfile.joinDate}</p>
                <p><strong>Actions This Month:</strong> {moderatorProfile.actionsThisMonth}</p>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              Edit Profile
            </button>
            <button className="delete-profile-btn" onClick={handleDeleteProfile}>
              Delete Profile
            </button>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      
      <footer className="loginpage-footer">
        <ul className="loginpage-footer-links">
          <li className="loginpage-footer-link" onClick={() => navigate('/about')}>About</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li className="loginpage-footer-link" onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
    </div>
    </div>
  );
};

export default ModeratorProfile;
