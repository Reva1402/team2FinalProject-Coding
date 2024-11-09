import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './ModeratorProfile.css';
import { signOut } from 'firebase/auth';

const ModeratorProfile = () => {
  const [moderatorProfile, setModeratorProfile] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser; 

  useEffect(() => {
    const fetchModeratorProfile = async () => {
      if (user) {
        const moderatorRef = doc(firestore, 'moderators', user.uid);
        const docSnap = await getDoc(moderatorRef);
        if (docSnap.exists()) {
          setModeratorProfile(docSnap.data());
        } else {
          console.log('No such moderator document!');
        }
      }
    };
    fetchModeratorProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        navigate('/login'); 
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to log out. Please try again.');
    }
  };

  const handleEditProfile = () => {
    navigate('/editmoderatorprofile');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/moderatorhomepage')}>
          Welcome, {moderatorProfile?.firstName || 'Moderator'}
        </div>
        <ul className="nav-links">
          <li className="nav-item" onClick={() => navigate('/viewModeratorProfile')}>Profile</li>
          <li className="nav-item" onClick={() => navigate('/manageEvents')}>Manage Events</li>
          <li className="nav-item" onClick={() => navigate('/moderatorNotifications')}>Notifications</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>
      
      <div className="profile-container">
        {moderatorProfile ? (
          <div className="profile-wrapper">
            <h1 className="profile-header">Moderator Profile</h1>
            <div className="profile-details">
              <div className="profile-picture">
                <img
                  src={moderatorProfile.profilepicture || 'default-profile.png'}
                  alt="Profile"
                  className="profile-img"
                />
              </div>
              <div className="profile-info">
                <p><strong>First Name:</strong> {moderatorProfile.firstName}</p>
                <p><strong>Last Name:</strong> {moderatorProfile.lastName}</p>
                <p><strong>Email:</strong> {moderatorProfile.email}</p>
                <p><strong>Phone Number:</strong> {moderatorProfile.phoneNumber}</p>
                <p><strong>Gender:</strong> {moderatorProfile.gender}</p>
                <p><strong>Date of Birth:</strong> {moderatorProfile.dateOfBirth}</p>
                <p><strong>Address:</strong> {moderatorProfile.address}</p>
                <p><strong>Country:</strong> {moderatorProfile.country}</p>
                <p><strong>Province:</strong> {moderatorProfile.province}</p>
                <p><strong>Role:</strong> {moderatorProfile.role}</p>
                
              </div>
            </div>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              Edit Profile
            </button>
          </div>
        ) : (
          <p>Loading moderator profile...</p>
        )}
      </div>
      
      <footer className="footer">
        <ul className="footer-links">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
    </div>
  );
};

export default ModeratorProfile;
