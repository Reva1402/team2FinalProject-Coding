import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './UserEditProfile.css';

const UserEditProfile = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [gender, setGender] = useState('');
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    const [profilepicture, setProfilePicture] = useState('');
    const [error, setError] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [userName, setUserName] = useState('');
 

    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                try {
                    const docRef = doc(firestore, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFirstName(data.firstName || '');
                        setLastName(data.lastName || '');
                        setEmail(data.email || '');
                        validateMobileNumber(data.mobileNumber || '');
                        setAddress(data.address || '');
                        setGender(data.gender || '');
                        setCountry(data.country || '');
                        setProvince(data.province || '');
                        setProfilePicture(data.profilepicture || '');
                        setUserName(data.firstName || '');
                    } else {
                        setError('User profile not found. Please check your account.');
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setError('Failed to fetch user profile. Please try again later.');
                }
            };
            fetchUserProfile();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result;
                    setProfilePicture(base64String);
                    if (user) {
                        const userDocRef = doc(firestore, 'users', user.uid);
                        await setDoc(userDocRef, { profilepicture: base64String }, { merge: true });
                        console.log('Profile picture (Base64) updated successfully in Firestore!');
                    } else {
                        setError('User not authenticated.');
                    }
                };
                reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    setError('Error processing image. Please try again.');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                setError('Error uploading profile picture. Please try again.');
            }
        } else {
            setError('No file selected. Please choose a valid image file.');
        }
    };

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        const cleanedValue = value.replace(/\D/g, '');
        if (cleanedValue.length <= 10) {
            setPhoneNumber(cleanedValue);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (user) {
                const userDoc = doc(firestore, 'users', user.uid);
                await setDoc(userDoc, {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    address,
                    gender,
                    country,
                    province,
                    profilepicture: profilepicture,
                }, { merge: true });

                setPopupMessage('Profile updated successfully!');
                setIsPopupVisible(true);

                setTimeout(() => {
                    setIsPopupVisible(false);
                    navigate('/UserProfile');
                }, 3000);
            } else {
                setError('User is not authenticated.');
            }
        } catch (err) {
            console.error('Update Profile Error:', err);
            setError('Failed to update profile: ' + (err.message || 'Unknown error'));
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    return (
        <div className="edit-profile">
            <nav className="navbar">
                    <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                        Hi, {userName || 'User'}
                    </div>
                    

                    {userName !== 'Guest' && (
                        <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
                    )}
                </nav>

                <aside className="edit-profile-sidebar">
                    <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
                    <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
                    <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
                    <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
                    <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
                    <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
                </aside>
    
         <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled
                    />
                </div>
                <div>
                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                    />
                </div>
                <div>
                    <label htmlFor="address">Address:</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="gender">Gender:</label>
                    <input
                        type="text"
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="country">Country:</label>
                    <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="province">Province:</label>
                    <input
                        type="text"
                        id="province"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="profilepicture">Profile Picture:</label>
                    <div className="profile-picture-container">
                        <img
                            src={profilepicture || 'default-profile.png'}
                            alt="Profile"
                            className="profile-picture"
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                    />
                </div>

                <button type="submit">Update Profile</button>
            </form>

            {isPopupVisible && (
                <div className="popup">
                    <p>{popupMessage}</p>
                </div>
            )}

                <footer className="footer">
                    <ul className="footer-links">
                        <li onClick={() => navigate('/about')}>About</li>
                        <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                        <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                        <li onClick={() => navigate('/contactus')}>Contact Us</li>
                    </ul>
                </footer>
        </div>
        </div>
    );
};

export default UserEditProfile;
