import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './userProfile.css';
import { signOut } from 'firebase/auth';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser; 

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.log('No such user document!');
        }
      }
    };
    fetchUserProfile();
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
    navigate('/editprofile');
  };

  return (
    <div>
       <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                    Hi, {userProfile?.firstName || 'User'}
                </div>
                <ul className="nav-links">
                    <li className="nav-item" onClick={() => navigate('/viewProfile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
   
    <div className="profile-container">
      {userProfile ? (
        <div className="profile-wrapper">
          <h1 className="profile-header">Your Profile</h1>
          <div className="profile-details">
            <div className="profile-picture">
              <img
                src={userProfile.profilepicture || 'default-profile.png'}
                alt="Profile"
                className="profile-img"
              />
            </div>
            <div className="profile-info">
              <p><strong>First Name:</strong> {userProfile.firstName}</p>
              <p><strong>Last Name:</strong> {userProfile.lastName}</p>
              <p><strong>Email:</strong> {userProfile.email}</p>
              <p><strong>Phone Number:</strong> {userProfile.mobilenumber}</p>
              <p><strong>Gender:</strong> {userProfile.gender}</p>
              <p><strong>Role:</strong> {userProfile.role}</p>
              <p><strong>Date of Birth:</strong> {userProfile.dateofbirth}</p>
              <p><strong>Address:</strong> {userProfile.address}</p>
              <p><strong>Country:</strong> {userProfile.country}</p>
              <p><strong>Province:</strong> {userProfile.province}</p>
            </div>
          </div>
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>
      ) : (
        <p>Loading profile...</p>
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

export default UserProfile;
