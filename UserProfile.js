// UserProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, onSnapshot, deleteDoc, collection, getDoc, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './UserProfile.css';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [updatedComments, setUpdatedComments] = useState({});
  const [userName, setUserName] = useState('');
  const [reportedEvents, setReportedEvents] = useState({});
  const [attendance, setAttendance] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsRef = collection(firestore, 'events');
      const eventSnapshot = await getDocs(eventsRef);
      const eventList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);

      const userLikes = {};
      if (user) {
          eventList.forEach(event => {
              if (event.likes && event.likes.includes(user.uid)) {
                  userLikes[event.id] = true;
              }
          });
      }
      setLikes(userLikes);

      const unsubscribeList = eventList.map(event => {
          const eventRef = doc(firestore, 'events', event.id);
          return onSnapshot(eventRef, (eventDoc) => {
              if (eventDoc.exists()) {
                  const eventCommentsData = eventDoc.data().comments || [];
                  setComments(prevComments => ({
                      ...prevComments,
                      [event.id]: eventCommentsData
                  }));
              }
          });
      });

      return unsubscribeList;
  };

  const fetchEventsAndListeners = async () => {
      const unsubscribeList = await fetchEvents();
      return unsubscribeList;
  };

  fetchEventsAndListeners().then(unsubscribeList => {
      return () => {
          unsubscribeList.forEach(unsubscribe => unsubscribe());
      };
  });

  const fetchAllUsers = async () => {
      await fetchUsers();
  };

  fetchAllUsers(); 

  const fetchAllEvents = async () => {
      await fetchEvents();
  };

  fetchAllEvents();

  const unsubscribeAuth = auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
          fetchUserData(currentUser.uid);
      } else {
          setUserName('Guest');
      }
  });

  return () => {
      unsubscribeAuth();
  };
}, []);

const fetchUsers = async () => {
  const usersSnapshot = await getDocs(collection(firestore, 'users'));
  const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setUsers(userList);
};

const fetchUserData = async (userId) => {
  try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
          setUserName(userDoc.data().firstName || "User");
      } else {
          setUserName("User");
      }
  } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName("User");
  }
};

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
     
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.log('No such user document!');
          setError('User profile not found.');
        }
      });

      
      return () => unsubscribe();
    }
  }, [user]);

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

  const handleEditProfile = () => {
    navigate('/UserEditProfile');
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

  const handleSearch = () => {
    console.log("Search Query:", searchQuery);
    if (searchQuery.trim() === '') {
        console.log("Search query is empty");
        return;
    }

  
    const eventsResult = events.filter(event =>
        event?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const usersResult = users.filter(user =>
        (user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    console.log("Filtered Events:", eventsResult);
    console.log("Filtered Users:", usersResult);

    setFilteredEvents(eventsResult);
    setFilteredUsers(usersResult);
};

const handleEventClick = (eventId) => {
    navigate(`/eventDetails/${eventId}`);
};

const handleUserClick = (userId) => {
    navigate(`/adminModeratorUserProfile/${userId}`);
};

  return (
   
      <div>
        <nav className="navbar">
          <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
            Hi, {userName || 'User'}
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
    
          <ul className="nav-links">
            {userName !== 'Guest' && (
              <>
                <li onClick={() => navigate('/UserProfile')}>Profile</li>
                <li onClick={() => navigate('/createevent')}>Post An Event</li>
                <li onClick={() => navigate('/MyEvents')}>My Events</li>
                <li onClick={() => navigate('/notifications')}>Notifications</li>
                <li onClick={() => navigate('/followers')}>Followers</li>
              </>
            )}
          </ul>
          {userName !== 'Guest' && (
            <button
              className="logout-btn"
              onClick={() => handleLogout()}
            >
              Logout
            </button>
          )}
        </nav>
    
        {/* Search Results Section */}
        {searchQuery && (filteredEvents.length > 0 || filteredUsers.length > 0) && (
          <div className="search-results">
            <h2>Search Results</h2>
            {filteredEvents.length > 0 && (
              <div>
                <h3>Events:</h3>
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="event-card"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <h4>{event.eventName}</h4>
                  </div>
                ))}
              </div>
            )}
            {filteredUsers.length > 0 && (
              <div>
                <h3>Users:</h3>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="user-card"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <h4>
                      {user.firstName} {user.lastName}
                    </h4>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    
        {/* Profile Section */}
        {!searchQuery && (
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
                    <p>
                      <strong>First Name:</strong> {userProfile.firstName}
                    </p>
                    <p>
                      <strong>Last Name:</strong> {userProfile.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {userProfile.email}
                    </p>
                    <p>
                      <strong>Phone Number:</strong> {userProfile.phoneNumber}
                    </p>
                    <p>
                      <strong>Gender:</strong> {userProfile.gender}
                    </p>
                    <p>
                      <strong>Role:</strong> {userProfile.role}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong> {userProfile.dateOfBirth}
                    </p>
                    <p>
                      <strong>Address:</strong> {userProfile.address}
                    </p>
                    <p>
                      <strong>Country:</strong> {userProfile.country}
                    </p>
                    <p>
                      <strong>Province:</strong> {userProfile.province}
                    </p>
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
        )}
    
        {/* Footer Section */}
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
