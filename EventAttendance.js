import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, getDocs, collection, Timestamp } from 'firebase/firestore';
import './EventAttendance.css';
import { signOut } from 'firebase/auth';


const EventAttendance = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [eventTimeFormatted, setEventTimeFormatted] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchEventData = async () => {
      const eventRef = doc(firestore, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        setEvent(eventData);

       
        if (eventData.time instanceof Timestamp) {
          const eventDate = eventData.time.toDate();
          setEventTimeFormatted(eventDate.toLocaleString());
        }

        if (eventData.attendees) {
          setAttendeesCount(eventData.attendees.length);
        }

        const user = auth.currentUser;
        if (user) {
          if (eventData.attendees?.includes(user.uid)) {
            setAttendanceStatus('attending');
          } else if (eventData.nonAttendees?.includes(user.uid)) {
            setAttendanceStatus('not attending');
          }
        }
      } else {
        console.log('Event not found!');
      }
    };

    const fetchUserEvents = async () => {
      const user = auth.currentUser;
      if (user) {
        const eventsRef = collection(firestore, 'events');
        const eventSnapshot = await getDocs(eventsRef);
        const events = eventSnapshot.docs.map((doc) => doc.data());
        const userAttendedEvents = events.filter(event => 
          event.attendees?.includes(user.uid)
        );
        setUserEvents(userAttendedEvents);
      }
    };

    fetchEventData();
    fetchUserEvents();
  }, [eventId]);

  const handleNextImage = () => {
    if (event && event.images && event.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % event.images.length);
    }
  };

  const handlePreviousImage = () => {
    if (event && event.images && event.images.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + event.images.length) % event.images.length
      );
    }
  };

  
  const hasEventConflict = () => {
    if (event && userEvents.length > 0) {
      const eventTime = event.time instanceof Timestamp ? event.time.toDate() : new Date(event.time);
      
      for (let userEvent of userEvents) {
        const userEventTime = userEvent.time instanceof Timestamp ? userEvent.time.toDate() : new Date(userEvent.time);

       
        if (userEventTime.getTime() === eventTime.getTime()) {
          return true; 
        }
      }
    }
    return false; 
  };

  const handleCheckboxChange = async (e) => {
    const isAttending = e.target.value === 'yes';
    const user = auth.currentUser;
  
    if (!user) return;
  
    const eventRef = doc(firestore, 'events', eventId);
  
    try {
      
      if (isAttending && hasEventConflict()) {
        alert('You are already attending an event at this time!');
        navigate('/userhomepage');
        return; 
      }

      setIsUpdating(true); 

     
      const newEventDoc = await getDoc(eventRef);
      const newEventData = newEventDoc.data();
  
    
      if (isAttending) {
        await updateDoc(eventRef, {
          attendees: arrayUnion(user.uid),
          nonAttendees: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(eventRef, {
          nonAttendees: arrayUnion(user.uid),
          attendees: arrayRemove(user.uid)
        });
      }

     
      const updatedEventDoc = await getDoc(eventRef);
      if (updatedEventDoc.exists()) {
        const updatedEventData = updatedEventDoc.data();
        setAttendeesCount(updatedEventData.attendees.length);
      }

    
      setAttendanceStatus(isAttending ? 'attending' : 'not attending');
      console.log(isAttending ? 'Attendance updated successfully!' : 'Non-attendance updated successfully!');

      
      setTimeout(() => {
        navigate('/userhomepage'); 
      }, 2000); 

    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setIsUpdating(false); 
    }
  };

  if (!event) return <div>Loading event data...</div>;

  return (
   

    <div className="event-attendance-page">
      <header>     
            <nav className="navbar">
            <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
          Hi, {userName || 'User'}
        </div>
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
                    <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
                )}
            </nav>
            </header> 
         
        
        {event.images && event.images.length > 0 && (
            <div className="event-image-carousel">
                <button
                    onClick={handlePreviousImage}
                    className="carousel-btn"
                >
                    &lt;
                </button>
                <img
                    src={event.images[currentImageIndex]}
                    alt={`${event.name} Event`}
                    className="event-image"
                />
                <button
                    onClick={handleNextImage}
                    className="carousel-btn"
                >
                    &gt;
                </button>
            </div>
        )}

        <h3>{event.name}</h3>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Event Time:</strong> {eventTimeFormatted}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Description:</strong> {event.description}</p>

        <p><strong>Number of Attendees:</strong> {attendeesCount}</p>
        
        <div className="attendance-question">
            <p>Do you want to attend this event?</p>
            <label>
                <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={attendanceStatus === 'attending'}
                    onChange={handleCheckboxChange}
                />
                Yes
            </label>
            <label>
                <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={attendanceStatus === 'not attending'}
                    onChange={handleCheckboxChange}
                />
                No
            </label>
        </div>

        {attendanceStatus === 'attending' && <p>You are attending this event!</p>}
        {attendanceStatus === 'not attending' && <p>You are not attending this event.</p>}

        {isUpdating && <p>Updating attendance... Please wait!</p>}

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

export default EventAttendance;
