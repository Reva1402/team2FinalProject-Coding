import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './AdminEditProfile.css';

const AdminEditProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    address: '',
    pushNotifications: false,
  });
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          setEditData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, editData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    const isConfirmed = window.confirm('Are you sure you want to delete your profile?');
    if (isConfirmed) {
      try {
        await deleteDoc(doc(firestore, 'users', user.uid));
        await signOut(auth);
        alert('Profile deleted successfully!');
        navigate('/');
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again.');
      }
    }
  };

  return (
    <div className="edit-profile-container">
      <header className="header">
        <div className="header-left">
          <h1>Admin One</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/AdminProfile')} className="profile-button">Profile</button>
          <button onClick={() => signOut(auth).then(() => navigate('/login'))} className="logout-button">Log Out</button>
        </div>
      </header>

      <div className="form-container">
        <h2>Edit Profile</h2>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            readOnly
          />
        </div>
        <div className="form-group">
          <label>Mobile Number:</label>
          <input
            type="text"
            name="mobileNumber"
            value={editData.mobileNumber}
            onChange={handleChange}
            placeholder="Enter your mobile number"
          />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={editData.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>
        <div className="form-group">
          <label>Push Notifications:</label>
          <input
            type="checkbox"
            name="pushNotifications"
            checked={editData.pushNotifications}
            onChange={handleChange}
          />
        </div>
        <button onClick={handleSave} className="save-button">Save Profile</button>
        <button onClick={handleDeleteProfile} className="delete-button">Delete Profile</button>
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

export default AdminEditProfile;
