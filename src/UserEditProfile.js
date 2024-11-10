import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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
    const [role, setRole] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [error, setError] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);

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
                        setPhoneNumber(data.phoneNumber || '');
                        setAddress(data.address || '');
                        setGender(data.gender || '');
                        setRole(data.role || '');
                        setDateOfBirth(data.dateOfBirth || '');
                        setCountry(data.country || '');
                        setProvince(data.province || '');
                        setProfilePicture(data.profilePicture || 'default-profile.png');
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
                    role,
                    dateOfBirth,
                    country,
                    province,
                    profilePicture,
                }, { merge: true });

                setPopupMessage('Profile updated successfully!');
                setIsPopupVisible(true);

                setTimeout(() => {
                    setIsPopupVisible(false);
                    navigate('/viewProfile');
                }, 3000);
            } else {
                setError('User is not authenticated.');
            }
        } catch (err) {
            console.error('Update Profile Error:', err);
            setError('Failed to update profile: ' + (err.message || 'Unknown error'));
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePicture(reader.result); 
            };
            reader.readAsDataURL(file);
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
                    Hi, {firstName || 'User'}
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
                        type="text"
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                    <label htmlFor="role">Role:</label>
                    <input
                        type="text"
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="dateOfBirth">Date of Birth:</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
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
                    <label htmlFor="profilePicture">Profile Picture:</label>
                    <input
                        type="file"
                        id="profilePicture"
                        onChange={handleProfilePictureChange}
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
    );
};

export default UserEditProfile;
