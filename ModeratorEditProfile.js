import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './ModeratorUserManagement.css'; 
import './ModeratorEditProfile.css';

const ModeratorEditProfile = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [editData, setEditData] = useState({
    mobileNumber: '',
    address: '',
    profilePicture: '',  
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [base64ProfilePic, setBase64ProfilePic] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const user = auth.currentUser;

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
      navigate('/ModeratorHomePage');
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
    <div className="moderator-management-container">
      <nav className="moderator-navbar">
        <h2>Welcome, Moderator</h2>
        <button className="profile-button" onClick={() => navigate('/moderatorprofile')}>Profile</button>
        <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
      </nav>


      <aside className="sidebar">
        <Link to="/moderatordashboard">Dashboard</Link>
        <Link to="/ModeratorHomePage">Feed</Link>
        <Link to="/ModeratorUserManagement">User Management</Link>
        <Link to="/ModeratorEventManagement">Event Management</Link>
        <Link to="/ModeratorCommentManagement">Comment Management</Link>
      </aside>

      <div className="form-container">
        <h2>Edit Profile</h2>
        <div className="form-group">
          <label>Mobile Number:</label>
          <input
            type="tel"
            name="mobileNumber"
            value={editData.mobileNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter your mobile number"
          />
          {error && <span className="error">{error}</span>}
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
          <label>Profile Picture:</label>
          <input
            type="file"
            onChange={handleProfilePicChange}
            accept="image/*"
          />
          {base64ProfilePic && (
            <div>
              <img
                src={base64ProfilePic}
                alt="Profile"
                className="profile-pic-preview"
                style={{ width: 100, height: 100, borderRadius: '50%' }}
              />
            </div>
          )}
        </div>
        <button onClick={handleSave} className="save-button">Save Profile</button>
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
  );
};

export default ModeratorEditProfile;
