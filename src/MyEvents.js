import React, { useEffect, useState } from 'react';
import { firestore, auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc , getDoc} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './MyEvent.css';

const MyEvents = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserEvents = async () => {
            try {
                const eventsRef = collection(firestore, 'events');
                const q = query(eventsRef, where('createdBy', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const userEvents = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setEvents(userEvents);
            } catch (err) {
                setError('Failed to fetch your events. Please try again later.');
            }
        };

        fetchUserEvents();
    }, [user, navigate]);

    const fetchUsers = async () => {
        const usersRef = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersRef);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
    };

    fetchUsers();

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
        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            if (currentUser) {
                fetchUserData(currentUser.uid); 
            } else {
                setUserName("Guest");
            }
        });
        
        return () => unsubscribe();
        
    }, []);
    
    

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            setError('Failed to log out. Please try again.');
        }
    };

    const handleEditEvent = (id) => {
        navigate(`/editevent/${id}`);
    };

    const handleViewEvent = (id) => {
        navigate(`/event/${id}`);
    };
    

    const handleDeleteEvent = async (id) => {
        try {

            const isConfirmed = window.confirm('Are you sure you want to delete this event?');


            if (isConfirmed) {
                const eventRef = doc(firestore, 'events', id);
                await deleteDoc(eventRef);
                alert('Event deleted successfully!');


                setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
            }
        } catch (err) {
            setError('Failed to delete event. Please try again later.');
        }
    };

    

    return (
        <div className="my-events">
  <nav className="evnavbar">
                    <div className="evnavbar-brand" onClick={() => navigate('/userhomepage')}>
                        Hi, {userName || 'User'}
                    </div>
                    

                    {userName !== 'Guest' && (
                        <button className="logout" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
                    )}
                </nav>

                <aside className="evsidebar">
                    <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
                    <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
                    <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
                    <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
                    <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
                    <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
                </aside>
        

          {error && <p className="error">{error}</p>}
      
          <div className="eveventslist">
            {events.length === 0 ? (
              <p>
                <h4>You have not created any events yet.</h4>
                <button onClick={() => navigate('/createevent')}>Create an Event</button>
              </p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="eveventcard">
                  <h2>Your Events</h2>
                  <h3>{event?.name}</h3>
                  <p>{event?.description}</p>
                 

                  
                  {event.images && event.images.length > 0 && (
                    <div className="myevent-event-images">
                      {event.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Event ${event.name} - Image ${index + 1}`}
                          className="myevent-event-image"
                        />
                      ))}
                    </div>
                  )}
                 <div className="event-buttons-container">
                  <button className="view-button" onClick={() => handleViewEvent(event.id)}>View</button>
                  <button className="edit-button" onClick={() => handleEditEvent(event.id)}>Edit</button>            
                  <button className="delete-button" onClick={() => handleDeleteEvent(event.id)}>Delete</button>               
                  </div>
                </div>
              ))
            )}
          </div>
      
         
          <footer className="evFooter">
            <ul className="evfooterslinks">
              <li onClick={() => navigate('/about')}>About</li>
              <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
              <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
              <li onClick={() => navigate('/contactus')}>Contact Us</li>
            </ul>
          </footer>
        </div>
      );
      
};

export default MyEvents;
