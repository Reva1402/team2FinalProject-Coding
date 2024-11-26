import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [likes, setLikes] = useState(0);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [eventStatus, setEventStatus] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const navigate = useNavigate();

  const convertTimestampToReadableDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); 
      return date.toLocaleString(); 
    }
    return 'Invalid Date';  
  };

  useEffect(() => {
    let isMounted = true; 

    const fetchEventDetails = async () => {
      try {
        const eventRef = doc(firestore, 'events', id);
        const eventDoc = await getDoc(eventRef);

        if (isMounted) {
          if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            setEvent(eventData);
            setLikes(eventData.likesCount || 0);
            setAttendeesCount(eventData.attendees ? eventData.attendees.length : 0);
            setFormattedDate(convertTimestampToReadableDate(eventData.date));  

            const today = new Date();
            const eventDate = new Date(eventData.date.seconds * 1000); 
            setEventStatus(eventData.status !== 'active' || today > eventDate ? 'Closed' : 'Open');
          } else {
            setError('Event not found.');
          }
        }
      } catch (error) {
        if (isMounted) setError(`Failed to fetch event details: ${error.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().firstName);
          }
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchEventDetails();
    fetchUserName();

    return () => {
      isMounted = false; 
    };
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
    <div className="event-details">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
          Hi, {userName || 'User'} 
        </div>

        {userName !== 'Guest' && (
          <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
        )}
      </nav>

      <aside className="event-details-sidebar">
        <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
        <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
        <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
        <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
        <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
        <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
      </aside>

      <div className="event-details-cont">
        <h1>{event?.name}</h1>
        <p>{event?.description}</p>
        <p><strong>Date:</strong> {formattedDate}</p> 
        <p><strong>Time:</strong> {event?.time}</p>
        <p><strong>Location:</strong> {event?.location}</p>
        <p><strong>Ticket Price:</strong> ${event?.ticketPrice}</p>

        <div className="event-stats">
          <p><strong>Likes:</strong> {likes}</p>
          <p><strong>Attendees:</strong> {attendeesCount}</p>
          <p><strong>Status:</strong> {eventStatus}</p>
        </div>

        {event?.images && event.images.length > 0 && (
          <div className="event-details-event-images">
            {event.images.map((image, index) => (
              <img key={index} src={image} alt={`Event ${event.name} -  ${index + 1}`} className="event-details-event-image" />
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
    </div>
  );
};

export default EventDetails;
