import React, { useEffect, useState, useRef } from 'react';
import { firestore, auth } from './firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';

import './EditEvent.css';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventDescription: '',
    ticketPrice: '',
    eventImages: [],
    latitude: '',
    longitude: ''
  });
  const [userName, setUserName] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState('');
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
          setUserName(userDoc.data().firstName || 'User');
        }
      } catch (err) {
        console.log('Error fetching user data:', err);
      }
    };

    const fetchEventDetails = async () => {
      try {
        const docRef = doc(firestore, 'events', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEvent(data);

      
          setFormData({
            eventName: data.eventName || '',
            eventDate: data.eventDate ? new Date(data.eventDate.seconds * 1000).toISOString().split('T')[0] : '',
            eventLocation: data.eventLocation || '',
            eventDescription: data.eventDescription || '',
            ticketPrice: data.ticketPrice || '',
            eventImages: data.eventImages || [],
            latitude: data.latitude || '',
            longitude: data.longitude || ''
          });
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to fetch event details.');
      }
    };

    const user = auth.currentUser;
    if (user) {
      fetchUserData(user.uid);
      fetchEventDetails();
    } else {
      setError('User not authenticated. Redirecting...');
      navigate('/login');
    }
  }, [id, navigate]);

  const handleGoogleMapsLoad = () => {
    setGoogleLoaded(true);
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setFormData({
        ...formData,
        eventLocation: place.formatted_address,
        latitude: lat,
        longitude: lng
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const fileReadPromise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(file);
      const base64Image = await fileReadPromise;
      uploadedImages.push(base64Image);
    }
    setFormData((prevData) => ({
      ...prevData,
      eventImages: uploadedImages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
      createdBy: auth.currentUser.uid,
      createdAt: new Date(),
    };

    try {
      const docRef = doc(firestore, 'events', id);
      await updateDoc(docRef, updatedData);
      navigate('/myevents'); 
    } catch (err) {
      setError('Failed to update event');
      console.error(err);
    }
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-event">
      
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
          Hi, {userName || 'User'}
        </div>
        <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>
          Logout
        </button>
      </nav>

     
      <aside className="edit-event-sidebar">
                    <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
                    <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
                    <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
                    <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
                    <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
                    <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
                </aside>

                <div className="edit-event-cont">
      <h2>Edit Event</h2>
      {error && <p className="error">{error}</p>}

 
 



      <form className="update-event-form" onSubmit={handleSubmit}>
  <div>
    <label>Event Name:</label>
    <input
      type="text"
      name="eventName"
      value={formData.eventName}
      onChange={handleInputChange}
      required
    />
  </div>
  <div>
    <label>Event Date:</label>
    <input
      type="date"
      name="eventDate"
      value={formData.eventDate}
      onChange={handleInputChange}
      required
    />
  </div>
  <div>
    <label>Event Location:</label>
    <LoadScript
      googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"
      libraries={['places']}
      onLoad={handleGoogleMapsLoad}
    >
      {googleLoaded && (
        <Autocomplete
          onPlaceChanged={handlePlaceChanged}
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        >
          <input
            type="text"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleInputChange}
            required
            placeholder="Start typing a location"
          />
        </Autocomplete>
      )}
    </LoadScript>
  </div>
  <div>
    <label>Event Description:</label>
    <textarea
      name="eventDescription"
      value={formData.eventDescription}
      onChange={handleInputChange}
      required
    />
  </div>
  <div>
    <label>Ticket Price:</label>
    <input
      type="number"
      name="ticketPrice"
      value={formData.ticketPrice}
      onChange={handleInputChange}
    />
  </div>
  <div>
    <label>Event Images:</label>
    <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
  </div>
  <button type="submit">Update Event</button>
</form>


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

export default EditEvent;
