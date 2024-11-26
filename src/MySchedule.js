import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';  
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';  
import { signOut } from 'firebase/auth';

import './MySchedule.css';

const MySchedule = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserName(userDoc.data().firstName || 'User');
          } else {
            console.warn('User document does not exist!');
            setUserName('User');
          }

          fetchEventsForUser(currentUser.uid); 
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName('User');
        }
      } else {
        setUserName('Guest');
      }
    };

    fetchUserData();
  }, []);

  const fetchEventsForUser = async (userId) => {
    try {
      const eventsRef = collection(firestore, 'events');
      const q = query(eventsRef, where('attendees', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      const upcoming = [];
      const past = [];
      const today = new Date();

      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        const eventDate = eventData.date instanceof Timestamp
          ? eventData.date.toDate()
          : new Date(eventData.date);

        if (!eventDate || isNaN(eventDate.getTime())) return;

        if (eventDate.getTime() > today.getTime()) {
          upcoming.push({ id: doc.id, ...eventData });
        } else {
          past.push({ id: doc.id, ...eventData });
        }
      });

      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="schedule-page">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
          Hi, {userName || 'User'}
        </div>
        {userName !== 'Guest' && (
          <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>
            Logout
          </button>
        )}
      </nav>

      <aside className="schedule-page-sidebar">
        <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
        <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
        <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
        <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
        <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
        <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
      </aside>

      <h2>Your Schedule</h2>

      <section className="events-section">
        <h3>Upcoming Events</h3>
        {upcomingEvents.length > 0 ? (
          <ul>
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.name}</strong>
                <p>Event Date: {new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming events.</p>
        )}
      </section>

      <section className="events-section">
        <h3>Past Events</h3>
        {pastEvents.length > 0 ? (
          <ul>
            {pastEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.name}</strong>
                <p>Event Date: {new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
                <p>Status: Attended</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past events.</p>
        )}
      </section>

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

export default MySchedule;
