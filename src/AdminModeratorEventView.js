import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import "./AdminModeratorEventView.css";

const AdminModeratorEventView = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);

  console.log('Captured event ID:', eventId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [likes, setLikes] = useState(0);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [eventStatus, setEventStatus] = useState('');
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!eventId) {
      setError('No event ID provided.');
      setLoading(false);
      return;
    }

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


          if (eventData.comments) {
            const formattedComments = eventData.comments.map(comment => {
              const commentDate = new Date(comment.createdAt); 
              return {
                text: comment.text,
                userNameBy: comment.userNameBy,
                createdAt: commentDate.toLocaleString(),
              };
            });
            setComments(formattedComments);
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

    const fetchUserDetails = async () => {
      if (currentUser) {
        try {
          const userRef = doc(firestore, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setFirstName(userSnap.data().firstName || 'User');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchEventDetails();
    fetchUserDetails();
  }, [eventId, currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const navigateToDashboard = async () => {
    if (currentUser) {
      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userRole = userSnap.data().role;
          if (userRole === 'admin') {
            navigate('/admindashboard');
          } else if (userRole === 'moderator') {
            navigate('/moderatorhomepage');
          } else if (userRole === 'standarduser' || userRole === 'user') {
            navigate('/userhomepage');
          } else {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        navigate('/login');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="AdminModeratorEventView">
          <nav className="navbar">
        <h2 onClick={navigateToDashboard} style={{ cursor: 'pointer' }}>
          Welcome
        </h2>
        <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
      </nav>
      <div className="event-details">

      <h1>{event?.name}</h1>
      <p>{event?.description}</p>
      <p><strong>Date:</strong> {new Date(event?.date?.toDate()).toLocaleString()}</p>
      <p><strong>Location:</strong> {event?.location}</p>
      <p><strong>Ticket Price:</strong> ${event?.ticketPrice || 'Free'}</p>

      <div className="event-stats">
        <p><strong>Likes:</strong> {likes}</p>
        <p><strong>Attendees:</strong> {attendeesCount}</p>
        <p><strong>Status:</strong> {eventStatus}</p>
      </div>

      {event?.images && event.images.length > 0 && (
        <div className="Viewevent-images">
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

      <div className="comments-sectionevent">
        <h2 id='comments'>Comments</h2>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="comment">
              <p><strong>{comment.userNameBy}</strong> <em>({comment.createdAt})</em></p>
              <p>{comment.text}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
      </div>

      <footer className="admincontentfooter">
        <ul className="admincontentfooterlinks">
          <li onClick={() => navigate('/about')}>About</li>
          <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
          <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
          <li onClick={() => navigate('/contactus')}>Contact Us</li>
        </ul>
      </footer>
      </div>
  );
};

export default AdminModeratorEventView;
