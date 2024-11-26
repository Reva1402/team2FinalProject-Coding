import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebaseConfig'; 
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import { signOut } from 'firebase/auth';
import './FilterEvents.css';

const FilterEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');

  
  const [userName, setUserName] = useState('');
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate(); 
  const user = auth.currentUser;

 
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (user) {
        setUserName(currentUser.firstName || currentUser.email); 
        fetchFollowing(currentUser.uid);  
        fetchEventsForUser(currentUser.uid);
      }
    };

    fetchUserData();
  }, []);


  const fetchFollowing = async (userId) => {
    try {
      const followingRef = doc(firestore, 'users', userId);
      const followingDoc = await getDoc(followingRef);
      if (followingDoc.exists()) {
        const followingData = followingDoc.data().following || []; 
        setFollowing(followingData);
      }
    } catch (error) {
      console.error('Error fetching following data:', error);
    }
  };

  const fetchCreatorName = async (createdBy) => {
    try {
      const userRef = doc(firestore, 'users', createdBy); 
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data().firstName + ' ' + userDoc.data().lastName;
      } else {
        return 'Unknown User';
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Error loading user';
    }
  };


  const fetchEventsForUser = async (userId) => {
    if (!userId) return;

    try {
      const eventsRef = collection(firestore, 'events');
      
     
      const q = query(
        eventsRef,
        where('createdBy', 'in', [userId, ...following]) 
      );
      
      const eventSnapshot = await getDocs(q);
      const eventList = await Promise.all(
        eventSnapshot.docs.map(async (doc) => {
          const eventData = doc.data();
          const creatorName = await fetchCreatorName(eventData.createdBy);  
          return { id: doc.id, ...eventData, creatorName };
        })
      );
      
      setEvents(eventList);
      setFilteredEvents(eventList);  
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

 
  const applyFilters = () => {
    let filtered = events;

    if (dateFilter) {
      const filterDate = new Date(dateFilter).toLocaleDateString();
      filtered = filtered.filter(event => new Date(event.date.seconds * 1000).toLocaleDateString() === filterDate);
    }

    if (locationFilter) {
      filtered = filtered.filter(event => event.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (ownerFilter) {
      filtered = filtered.filter(event => event.creatorName.toLowerCase().includes(ownerFilter.toLowerCase()));
    }

    setFilteredEvents(filtered);
  };

 
  const handleFilterChange = () => {
    applyFilters();
  };

  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    handleFilterChange();
  };

  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
    handleFilterChange();
  };

  const handleOwnerFilterChange = (e) => {
    setOwnerFilter(e.target.value);
    handleFilterChange();
  };

  const handleEventClick = (eventId) => {
    navigate(`/adminModeratorEventView/${eventId}`);
  };

  return (
    <div className="filterseventspage">
      <nav className="filtereventsnavbar">
        <div className="filtereventsnavbar-brand" onClick={() => navigate('/userhomepage')}>
          Hi, {userName || 'User'}
        </div>
       
        {userName !== 'Guest' && (
          <button className="filtereventslogout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
        )}
      </nav>

      <aside className="filtereventssidebar">

        
        <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
        <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
        <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
        <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
        <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
        <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
      </aside>

      <h2>Filter Events</h2>

      <div className="filterssss">
        <label htmlFor="date">Date:</label>
        <input 
          type="date" 
          id="date" 
          value={dateFilter}
          onChange={handleDateFilterChange}
        />

        <label htmlFor="location">Location:</label>
        <input 
          type="text" 
          id="location" 
          placeholder="Search by location"
          value={locationFilter}
          onChange={handleLocationFilterChange}
        />

        <label htmlFor="owner">Owner:</label>
        <input 
          type="text" 
          id="owner" 
          placeholder="Search by owner"
          value={ownerFilter}
          onChange={handleOwnerFilterChange}
        />
      </div>

      <section className="filterevents-list">
        <h3>Events</h3>
        {filteredEvents.length > 0 ? (
          <ul>
            {filteredEvents.map((event) => (
              <li key={event.id} onClick={() => handleEventClick(event.id)} style={{ cursor: 'pointer' }}>
                <strong>{event.name}</strong>
                <p>Event By: {event.creatorName}</p> 
              </li>
            ))}
          </ul>
        ) : (
          <p>No events found matching the filters.</p>
        )}
      </section>
      <footer className="filtereventsfooter">
                    <ul className="filtereventsfooter-links">
                        <li onClick={() => navigate('/about')}>About</li>
                        <li onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                        <li onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                        <li onClick={() => navigate('/contactus')}>Contact Us</li>
                    </ul>
                </footer>
    </div>
  );
};

export default FilterEvents;
