import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); 
    const user = auth.currentUser;

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                console.log('Fetching event with ID:', id);
                const eventRef = doc(firestore, 'events', id);
                const eventDoc = await getDoc(eventRef);

                if (eventDoc.exists()) {
                    setEvent(eventDoc.data());
                } else {
                    setError('Event not found.');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event details:', error);
                setError('Failed to fetch event details.');
                setLoading(false);
            }
        };

      
        fetchEventDetails();
    }, [id]);

    if (loading) return <div>Loading event details...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

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
        <div className="container mt-5">
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>Hi, {user?.displayName || 'User'}</div>
                <ul className="nav-links">
                <li className="nav-item" onClick={() => navigate('/viewProfile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            <h1>{event?.eventName}</h1>
            <p>{event?.eventDescription}</p>
            <p><strong>Date:</strong> {event?.eventDate}</p>
            <p><strong>Time:</strong> {event?.eventTime}</p>
            <p><strong>Location:</strong> {event?.eventLocation}</p>
            <p><strong>Ticket Price:</strong> ${event?.ticketPrice}</p>
            <div className="event-images">
                {event?.eventImages?.length > 0 ? event.eventImages.map((image, index) => (
                    <img key={index} src={image} alt={`Event image ${index + 1}`} className="img-fluid mb-3" />
                )) : <p>No images available for this event.</p>}
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

export default EventDetails;