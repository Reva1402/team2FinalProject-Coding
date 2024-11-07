import React, { useEffect, useState } from 'react';
import { firestore, auth } from './firebaseConfig';
import { collection,doc,query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './MyEvents.css';
import { signOut } from 'firebase/auth';

const MyEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');

    useEffect(() => {

        const fetchEvents = async () => {
            try {
                const userUid = auth.currentUser?.uid;

                if (!userUid) {

                    navigate('/login');
                    return;
                }
                const eventsRef = collection(firestore, 'events');
                const eventsQuery = query(eventsRef, where('createdBy', '==', userUid));
                const firstName= auth.currentUser?.firstname;
                const querySnapshot = await getDocs(eventsQuery);
                const eventList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setEvents(eventList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching events: ", error);
                setError('Failed to load events. Please try again.');
                setLoading(false);
            }
        };

        fetchEvents();
    }, [navigate]);
    

    if (loading) {
        return <div>Loading events...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

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
        <div>
             <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                    Welcome {firstName}
                </div>
                <ul className="nav-links">
                    <li className="nav-item" onClick={() => navigate('/viewprofile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>
        
        <div className="container">
            <h1>My Events</h1>
            {events.length === 0 ? (
                <p className="no-events">
                    No events found. Create one now!
                    <button onClick={() => navigate('/createevent')}>Create Event</button>
                </p>
            ) : (
                <ul className="list-group">
                    {events.map((event) => (
                        <li key={event.id} className="list-group-item">
                            <h5>{event.name}</h5>
                            <p>{event.description || 'No description available'}</p>
                            <p><strong>Date:</strong> {event.date} | <strong>Time:</strong> {event.time}</p>
                            <p><strong>Location:</strong> {event.location}</p>
                            <button onClick={() => navigate(`/event/${event.id}`)}>View Details</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        </div>
    );
};

export default MyEvents;
