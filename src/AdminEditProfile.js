import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './AdminEditProfile.css';

const AdminEditProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [editData, setEditData] = useState({
    mobileNumber: '',
    address: '',
    profilePicture: '',  
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [base64ProfilePic, setBase64ProfilePic] = useState(''); 
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
            setEditData({
              mobileNumber: docSnap.data().mobileNumber || '',
              address: docSnap.data().address || '',
              profilePicture: docSnap.data().profilePicture || '',
            });
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64ProfilePic(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, '');
    if (cleanedValue.length <= 10) {
      setPhoneNumber(cleanedValue);
      setEditData((prevData) => ({
        ...prevData,
        mobileNumber: cleanedValue, 
      }));
    }
    if (!validateMobileNumber(cleanedValue)) {
      setError('Invalid mobile number format. Please enter a 10-digit number starting with a digit between 1 and 9.');
    } else {
      setError('');
    }
  };

  const validateMobileNumber = (mobilenumber) => {
    const mobilePattern = /^[1-9][0-9]{9}$/;
    return mobilePattern.test(mobilenumber);
  };

  const handleSave = async () => {
    try {
      let updatedData = { ...editData };
      if (profilePicFile) {
        updatedData.profilePicture = base64ProfilePic;  
      }
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, updatedData);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }

      alert('Profile updated successfully!');
      navigate('/AdminProfile');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-edit-profile-container">
    <header className="admin-edit-profile-navbar">
      <h1>Welcome Admin</h1>
      <div className="admin-edit-profile-navbar-right">
        <Link to="/AdminProfile" className="admin-edit-profile-profile-link">
          Profile
        </Link>
        <button className="admin-edit-profile-logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
    </header>
    <aside className="admin-edit-profile-sidebar">
      <Link to="/AdminDashboard" className="admin-edit-profile-sidebar-link">Dashboard</Link>
      <Link to="/users" className="admin-edit-profile-sidebar-link">User Management</Link>
      <Link to="/moderatormanagement" className="admin-edit-profile-sidebar-link">Moderator Management</Link>
      <Link to="/suspendedresources" className="admin-edit-profile-sidebar-link">Suspended Resources</Link>
      <Link to="/Admincontentmanagement" className="admin-edit-profile-sidebar-link">Content Management</Link>
      <Link to="/Adminsupport" className="admin-edit-profile-sidebar-link">Support Management</Link>
      <h4>
        <a
          href="https://console.firebase.google.com/u/0/project/finalproject-e37f8/firestore/databases/-default-/rules"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-edit-profile-security-link"
        >
          Security Rules
        </a>
      </h4>
    </aside>
    <div className="admin-edit-profile-form-container">
      <h2>Edit Profile</h2>
      <div className="admin-edit-profile-form-group">
        <label>Mobile Number:</label>
        <input
          type="tel"
          name="mobileNumber"
          value={editData.mobileNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter your mobile number"
          className="admin-edit-profile-input"
        />
        {error && <span className="admin-edit-profile-error">{error}</span>}
      </div>
      <div className="admin-edit-profile-form-group">
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={editData.address}
          onChange={handleChange}
          placeholder="Enter your address"
          className="admin-edit-profile-input"
        />
      </div>
      <div className="admin-edit-profile-form-group">
        <label>Profile Picture:</label>
        <input
          type="file"
          onChange={handleProfilePicChange}
          accept="image/*"
          className="admin-edit-profile-file-input"
        />
        {base64ProfilePic && (
          <div className="admin-edit-profile-pic-preview-container">
            <img
              src={base64ProfilePic}
              alt="Profile"
              className="admin-edit-profile-pic-preview"
            />
          </div>
        )}
      </div>
      <button onClick={handleSave} className="admin-edit-profile-save-button">Save Profile</button>
    </div>
    <footer className="admin-edit-profile-footer">
      <ul className="admin-edit-profile-footer-links">
        <li onClick={() => navigate('/about')} className="admin-edit-profile-footer-link">About</li>
        <li onClick={() => navigate('/privacypolicy')} className="admin-edit-profile-footer-link">Privacy Policy</li>
        <li onClick={() => navigate('/termsandconditions')} className="admin-edit-profile-footer-link">Terms and Conditions</li>
        <li onClick={() => navigate('/contactus')} className="admin-edit-profile-footer-link">Contact Us</li>
      </ul>
    </footer>
  </div>
  
  );
};

export default AdminEditProfile;
