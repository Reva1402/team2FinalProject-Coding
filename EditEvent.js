import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const EditEvent = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const user = auth.currentUser;
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({
        eventName: '',
        eventDate: '',
        eventLocation: '',
        eventDescription: '',
        eventTime: '',
        ticketPrice: '',
        eventImages: [],
    });
    const [userName, setUserName] = useState('');
    const [error, setError] = useState(''); 
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState(''); 

   
    const fetchUserData = async (userId) => {
        try {
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            if (userDoc.exists()) {
                setUserName(userDoc.data().firstName || "User");
            } else {
                setUserName("User");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserName("User");
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserData(user.uid);
        } else {
            setUserName("Guest");
        }
    }, [user]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (user) {
                try {
                    const docRef = doc(firestore, 'events', id); 
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log('Fetched event data:', data); 

                        if (data.createdBy !== user.uid) {
                            setError('You do not have permission to edit this event.');
                            return;
                        }

                        
                        setEvent(data);
                        setFormData({
                            eventName: data.eventName || '',
                            eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split('T')[0] : '',
                            eventLocation: data.eventLocation || '',
                            eventDescription: data.eventDescription || '',
                            eventTime: data.eventTime || '',
                            ticketPrice: data.ticketPrice || '',
                            eventImages: data.eventImages || [],
                        });
                    } else {
                        setError('Event not found. Please check the event ID.');
                    }
                } catch (error) {
                    console.error('Error fetching event details:', error);
                    setError('Failed to fetch event details. Please try again later.');
                }
            } else {
                navigate('/MyEvents');
            }
        };

        fetchEventDetails();
    }, [user, id, navigate]);

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

        try {
            if (user) {
                const eventDoc = doc(firestore, 'events', id);
                await setDoc(eventDoc, formData, { merge: true });

                setPopupMessage('Event updated successfully!');
                setIsPopupVisible(true);
                setTimeout(() => {
                    setIsPopupVisible(false);
                    navigate('/myevents');
                }, 3000);
            } else {
                setError('User is not authenticated.');
            }
        } catch (err) {
            console.error('Error updating event:', err);
            setError('Failed to update event: ' + (err.message || 'Unknown error'));
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
        <div className="edit-event">
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/userhomepage')}>
                    Hi, {userName || 'User'}
                </div>
                <ul className="nav-links">
                    <li className="nav-item" onClick={() => navigate('/UserProfile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            <h2>Edit Event</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Event Name:</label>
                    <input
                        type="text"
                        name="eventName"
                        value={formData.eventName || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Event Date:</label>
                    <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Event Time:</label>
                    <input
                        type="time"
                        name="eventTime"
                        value={formData.eventTime || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Location:</label>
                    <input
                        type="text"
                        name="eventLocation"
                        value={formData.eventLocation || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        name="eventDescription"
                        value={formData.eventDescription || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Ticket Price:</label>
                    <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice || ''}
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
                <button type="submit">Update Event</button>
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

export default EditEvent;
