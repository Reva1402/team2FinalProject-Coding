import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './ContactUs.css';

const ContactUs = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const user = auth.currentUser;
    const userName = user ? user.displayName : 'Guest';
    useEffect(() => {
        if (!user) {
            alert('Please log in to submit the form.');
            navigate('/login');
        } else {
            const fetchUserData = async () => {
                try {
                    const userDocRef = doc(firestore, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setName(userData.firstName || '');
                        setEmail(userData.email || '');
                    } else {
                        console.error('No user data found!');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };

            fetchUserData();
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message) {
            alert('Please enter a message.');
            return;
        }

        if (!auth.currentUser) {
            alert('You must be logged in to submit the form.');
            return;
        }

        try {
            const newContactKey = Date.now().toString();
            const contactRef = doc(collection(firestore, 'contacts'), newContactKey);

            await setDoc(contactRef, {
                name: name,
                email: email,
                message: message,
                userId: auth.currentUser.uid,
                timestamp: new Date().toISOString()
            });

            setMessage('');
            alert('Your message has been sent successfully!');
            navigate('/userhomepage');
        } catch (error) {
            console.error('Error saving form data:', error);
            alert('There was an error sending your message. Please try again later.');
        }
    };
    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="contact-container">
  <nav className="moderator-navbar">
        <h2>Welcome to Eventopia</h2>
        <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
      </nav>
            {user ? (
                <form onSubmit={handleSubmit} className="contact-form">
                    <h2>Contact Us</h2>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            readOnly
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit">Send</button>
                </form>
            ) : (
                <div>
                    <p>Please log in to send a message.</p>
                    <button onClick={handleLoginClick}>Log in</button> 
                </div>
            )}
            <footer className="loginpage-footer">
                <ul className="loginpage-footer-links">
                    <li className="loginpage-footer-link" onClick={() => navigate('/about')}>About</li>
                    <li className="loginpage-footer-link" onClick={() => navigate('/privacypolicy')}>Privacy Policy</li>
                    <li className="loginpage-footer-link" onClick={() => navigate('/termsandconditions')}>Terms and Conditions</li>
                    <li className="loginpage-footer-link" onClick={() => navigate('/contactus')}>Contact Us</li>
                </ul>
            </footer>
        </div>
    );
};

export default ContactUs;
