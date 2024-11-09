import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import './userProfile.css';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.log('No such user document!');
        }
      });

      return () => unsubscribe(); // Cleanup the listener on component unmount
    }
  }, [user]);

  const handleEditProfile = () => {
    navigate('/UserEditProfile');
  };

  return (
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
              <p><strong>Phone Number:</strong> {userProfile.phoneNumber}</p>
              <p><strong>Gender:</strong> {userProfile.gender}</p>
              <p><strong>Role:</strong> {userProfile.role}</p>
              <p><strong>Date of Birth:</strong> {userProfile.dateOfBirth}</p>
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
  );
};

export default UserProfile;
