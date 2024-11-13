import React, { useEffect, useState } from 'react';
import { firestore, auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';


const MyEvents = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');

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
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>Hi, {user?.displayName || 'User'}</div>
                <ul className="nav-links">
                <li className="nav-item" onClick={() => navigate('/UserProfile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            <h2>Your Events</h2>
            {error && <p className="error">{error}</p>}

            <div className="events-list">
                {events.length === 0 ? (
                    <p><h4>You have not created any events yet.</h4>
                        <button onClick={() => navigate('/createevent')}>Create an Event</button></p>


                ) : (
                    events.map((event) => (
                        <div key={event.id} className="event-card">
                            <h3>{event.eventName}</h3>
                            <p>{event.eventDescription}</p>
                            <p><strong>Date:</strong> {event.eventDate}</p>
                            <p><strong>Location:</strong> {event.eventLocation}</p>
                            <p><strong>Ticket Price:</strong> ${event.ticketPrice}</p>
                            <button onClick={() => handleViewEvent(event.id)}>View</button>
                            <button onClick={() => handleEditEvent(event.id)}>Edit</button>
                            <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                        </div>
                    ))
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

export default MyEvents;
