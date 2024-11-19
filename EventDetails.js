import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState(''); 
    const navigate = useNavigate();
    const [likes, setLikes] = useState(0);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [eventStatus, setEventStatus] = useState('');
  const [eventId, setEventId] = useState(id);

    useEffect(() => {  
    const fetchEventDetails = async () => {
        try {
         
          console.log('Fetching event with ID:', eventId);
          
          const eventRef = doc(firestore, 'events', eventId);
          const eventDoc = await getDoc(eventRef);
  
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setEvent(eventData);
  
            
            setLikes(eventData.likesCount || 0);
            setAttendeesCount(eventData.attendees ? eventData.attendees.length : 0);
  
           
            const today = new Date();
            const eventDate = new Date(eventData.date);
            if (eventData.status !== 'active' || today > eventDate) {
              setEventStatus('Closed');
            } else {
              setEventStatus('Open');
            }
          } else {
            setError('Event not found.');
          }
        } catch (error) {
          setError(`Failed to fetch event details: ${error.message}`);
          console.error('Error fetching event details:', error);
        } finally {
          setLoading(false);
        }
      };

        const fetchUserName = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().firstName );
                    }
                }
            } catch (error) {
                console.error("Error fetching username:", error);
            }
        };

        fetchEventDetails();
        fetchUserName();
    }, [id]);


    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    if (loading) return <div>Loading event details...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-5">
          
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                    Hi, {userName}
                </div>
                <ul className="nav-links">
                    <li className="nav-item" onClick={() => navigate('/Userprofile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

          
            <h1>{event?.name}</h1>
            <p>{event?.description}</p>
            <p><strong>Date:</strong> {event?.date}</p>
            <p><strong>Time:</strong> {event?.time}</p>
            <p><strong>Location:</strong> {event?.location}</p>
            <p><strong>Ticket Price:</strong> ${event?.ticketPrice}</p>
            <div className="event-stats">
        <p><strong>Likes:</strong> {likes}</p>
        <p><strong>Attendees:</strong> {attendeesCount}</p>
        <p><strong>Status:</strong> {eventStatus}</p>
      </div>

            {event?.images && event.images.length > 0 && (
                <div className="event-images">
                    {event.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Event ${event.name} - Image ${index + 1}`}
                            className="event-image"
                        />
                    ))}
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

export default EventDetails;
