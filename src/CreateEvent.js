import React, { useState, useEffect, useRef } from 'react';
import { firestore, auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Timestamp, getDoc, doc } from 'firebase/firestore';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import './createevent.css';


const CreateEvent = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventDescription: '',
    ticketPrice: '',
    eventImages: [],
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const autocompleteRef = useRef(null); 
  const user = auth.currentUser;

  const handleGoogleMapsLoad = () => {
    setGoogleLoaded(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        setUserName(userDoc.data().firstName || 'User');
      } else {
        setUserName('User');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserName('User');
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        setUserName('Guest');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (user) {
      try {
        const eventTimestamp = Timestamp.fromDate(new Date(formData.eventDate));

        await addDoc(collection(firestore, 'events'), {
          name: formData.eventName,
          date: eventTimestamp,
          location: formData.eventLocation,
          description: formData.eventDescription,
          ticketPrice: formData.ticketPrice,
          images: formData.eventImages,
          latitude: formData.latitude,
          longitude: formData.longitude,
          createdBy: user.uid,
          createdAt: new Date(),
        });

        setPopupMessage('Event created successfully!');
        setIsPopupVisible(true);

        setFormData({
          eventName: '',
          eventDate: '',
          eventLocation: '',
          eventDescription: '',
          ticketPrice: '',
          eventImages: [],
          latitude: '',
          longitude: '',
        });

        setTimeout(() => {
          setIsPopupVisible(false);
          navigate('/myevents');
        }, 3000);
      } catch (err) {
        console.error('Failed to create event:', err);
        setError('Failed to create event: ' + (err.message || 'Unknown error'));
      }
    } else {
      setError('User is not authenticated.');
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const uploadedImages = [];
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
 
        const reader = new FileReader();
        
       
        const fileReadPromise = new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64String = reader.result;
            resolve(base64String); 
          };
          reader.onerror = (error) => reject(error); 
        });
  
      
        reader.readAsDataURL(file);
        
       
        const base64Image = await fileReadPromise;
        uploadedImages.push(base64Image);
      }
  
      
      setFormData((prevData) => ({
        ...prevData,
        eventImages: uploadedImages,
      }));
    }
  };
  

  
  const handleLocationChange = (e) => {
    setFormData({ ...formData, eventLocation: e.target.value });
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
        longitude: lng,
      });
    }
  };

  return (

    <div className="create-event">
      <nav className="navbar">
                    <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                        Hi, {userName || 'User'}
                    </div>
                    

                    {userName !== 'Guest' && (
                        <button className="logout-btn" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
                    )}
      </nav>

                <aside className="create-event-sidebar">
                    <button className="btn btn-link" onClick={() => navigate('/UserProfile')}>Profile</button>
                    <button className="btn btn-link" onClick={() => navigate('/createevent')}>Post An Event</button>
                    <button className="btn btn-link" onClick={() => navigate('/MyEvents')}>My Events</button>
                    <button className='btn btn-link' onClick={() => navigate('/followers')}>Followers</button>
                    <button className='btn btn-link' onClick={() => navigate('/mySchedule')}>My Schedule</button>
                    <button className="btn btn-link" onClick={() => navigate('/filterEvents')}>Filter Events</button>
                </aside>

                <div className="create-event-container">
        <h2>Create Event</h2>
        {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
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
            googleMapsApiKey="AIzaSyAipP-PPc3YltY3nAZbGLFBuK-c2TrWXgY"
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
                  onChange={handleLocationChange}
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
          ></textarea>
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

        <button type="submit">Create Event</button>
      </form>

      {isPopupVisible && <div className="popup">{popupMessage}</div>}


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

export default CreateEvent;
