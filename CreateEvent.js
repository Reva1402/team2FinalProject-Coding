import React, { useState } from 'react';
import { firestore, auth } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './createevent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    eventDescription: '',
    eventTime: '',
    ticketPrice: '',
    eventImages: [],
  });

  const [error, setError] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEventImageChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const imageFiles = Array.from(files).map((file) => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imageFiles).then((images) => {
        setFormData((prevData) => ({ ...prevData, eventImages: images }));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const user = auth.currentUser;

    try {
        if (user) {
            const eventsRef = collection(firestore, 'events');
            await addDoc(eventsRef, {
                ...formData,
                createdBy: user.uid,
                createdAt: new Date(),
                createdByName: user.displayName || "Anonymous",  // Add userName here
            });

            setPopupMessage('Event created successfully!');
            setIsPopupVisible(true);
            setTimeout(() => {
                setIsPopupVisible(false);
                navigate('/myevents');
            }, 3000);
        } else {
            setError('User is not authenticated.');
        }
    } catch (err) {
        setError('Failed to create event: ' + (err.message || 'Unknown error'));
    }
};


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      setError('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="create-event">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>Hi, {user?.displayName || 'User'}</div>
        <ul className="nav-links">
        <li className="nav-item" onClick={() => navigate('/UserProfile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

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
          <label>Event Time:</label>
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
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
            required
          />
        </div>
        <div>
          <label>Event Images:</label>
          <input
            type="file"
            onChange={handleEventImageChange}
            multiple
            accept="image/*"
          />
        </div>
        <button type="submit">Create Event</button>
      </form>

      {isPopupVisible && (
        <div className="popup">
          <p>{popupMessage}</p>
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

export default CreateEvent;