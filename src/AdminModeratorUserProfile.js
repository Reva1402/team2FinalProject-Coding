import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import "./AdminModeratorUserProfile.css";

const AdminModeratorUserProfile = () => {
  const { userId } = useParams(); 
  const [userProfile, setUserProfile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const userRef = doc(firestore, 'users', userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
            setFirstName(userSnap.data().firstName || ''); 
          } else {
            setError('User not found.');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to load user profile.');
        }
      }
    };

    fetchUserProfile();
  }, [userId]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const navigateToDashboard = async () => {
    if (currentUser) {
      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userRole = userSnap.data().role;
          if (userRole === 'admin') {
            navigate('/admindashboard');
          } else if (userRole === 'moderator') {
            navigate('/moderatorhomepage');
          } else if (userRole === 'standarduser' || userRole === 'user') {
            navigate('/userhomepage');
          } else {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        navigate('/login');
      }
    }
  };

  return (
    <div className="AdminModeratorssUserProfile">
      <nav className="asminmodnavbar">
        <h2 onClick={navigateToDashboard} style={{ cursor: 'pointer' }}>
          Welcome
        </h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="adminmoddprofile-container">
        {userProfile ? (
          <div className="adminprofile-wrapper">
            <h1 className="adminmoddprofile-header">User Profile</h1>
            <div className="adminnmodprofile-details">
              <div className="adminmoddprofile-picture">
                <img
                  src={userProfile.profilepicture || 'default-profile.png'}
                  alt="Profile"
                  className="adminmodprofile-img"
                />
              </div>
              <div className="addminmodprofile-info">
                <p><strong>First Name:</strong> {userProfile.firstName}</p>
                <p><strong>Last Name:</strong> {userProfile.lastName}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Phone Number:</strong> {userProfile.phoneNumber}</p>
                <p><strong>Gender:</strong> {userProfile.gender}</p>
                <p><strong>Role:</strong> {userProfile.role}</p>
                <p><strong>Date of Birth:</strong> {userProfile.dateOfBirth}</p>
                <p><strong>Address:</strong> {userProfile.address}</p>
                <p><strong>Country:</strong> {userProfile.country}</p>
                <p><strong>Province:</strong> {userProfile.province}</p>
              </div>
            </div>
          </div>
        ) : (
          <p>{error || 'Loading profile...'}</p>
        )}
      </div>

      <footer className="adminmoddfooter">
        <ul className="adminmodfooter-links">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
    </div>
  );
};

export default AdminModeratorUserProfile;
