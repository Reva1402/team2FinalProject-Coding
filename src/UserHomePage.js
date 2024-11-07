import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './UserHomePage.css';

import holiImage1 from './images/holi1.jpg';
import holiImage2 from './images/holi2.jpg';
import holiImage3 from './images/holi3.jpg';
import christmasImage1 from './images/christmas1.jpg';
import christmasImage2 from './images/christmas2.jpg';
import christmasImage3 from './images/christmas3.jpg';

const HomePage = () => {
    const navigate = useNavigate();
    const [likedHoli, setLikedHoli] = useState(false);
    const [commentsHoli, setCommentsHoli] = useState([]);
    const [newCommentHoli, setNewCommentHoli] = useState('');
    const [currentHoliImageIndex, setCurrentHoliImageIndex] = useState(0);

    const [likedChristmas, setLikedChristmas] = useState(false);
    const [commentsChristmas, setCommentsChristmas] = useState([]);
    const [newCommentChristmas, setNewCommentChristmas] = useState('');
    const [currentChristmasImageIndex, setCurrentChristmasImageIndex] = useState(0);

    const holiImages = [holiImage1, holiImage2, holiImage3];
    const christmasImages = [christmasImage1, christmasImage2, christmasImage3];

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to log out. Please try again.');
        }
    };

    const handleLikeToggleHoli = () => {
        setLikedHoli(!likedHoli);
    };

    const handleCommentSubmitHoli = (e) => {
        e.preventDefault();
        if (newCommentHoli.trim()) {
            setCommentsHoli([...commentsHoli, newCommentHoli]);
            setNewCommentHoli('');
        }
    };

    const handleReportEventHoli = () => {
        alert("Holi event has been reported. Our moderators will review it shortly.");
    };

    const handleNextHoliImage = () => {
        setCurrentHoliImageIndex((prevIndex) => (prevIndex + 1) % holiImages.length);
    };

    const handlePreviousHoliImage = () => {
        setCurrentHoliImageIndex((prevIndex) => (prevIndex - 1 + holiImages.length) % holiImages.length);
    };

    const handleLikeToggleChristmas = () => {
        setLikedChristmas(!likedChristmas);
    };

    const handleCommentSubmitChristmas = (e) => {
        e.preventDefault();
        if (newCommentChristmas.trim()) {
            setCommentsChristmas([...commentsChristmas, newCommentChristmas]);
            setNewCommentChristmas('');
        }
    };

    const handleReportEventChristmas = () => {
        alert("Christmas event has been reported. Our moderators will review it shortly.");
    };

    const handleNextChristmasImage = () => {
        console.log("Next Image Clicked");
        setCurrentChristmasImageIndex((prevIndex) => (prevIndex + 1) % christmasImages.length);
    };
    
    const handlePreviousChristmasImage = () => {
        console.log("Previous Image Clicked");
        setCurrentChristmasImageIndex((prevIndex) => (prevIndex - 1 + christmasImages.length) % christmasImages.length);
    };
    
    return (
        <div className="home-page">
            <nav className="navbar">
                <div className="navbar-brand" onClick={() => navigate('/')}>
                    Community Event Platform
                </div>
                <ul className="nav-links">
                    <li className="nav-item" onClick={() => navigate('/viewprofile')}>Profile</li>
                    <li className="nav-item" onClick={() => navigate('/myevents')}>My Events</li>
                    <li className="nav-item" onClick={() => navigate('/createevent')}>Post An Event</li>
                    <li className="nav-item" onClick={() => navigate('/notifications')}>Notifications</li>
                    <li className="nav-item" onClick={() => navigate('/followers')}>Followers</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </nav>

            <div className="home-content">
                <h2>Welcome to the Community Event Platform</h2>
                <p>Explore events, interact with the community, and stay connected!</p>

                <div className="event-card">
                    <h3>Holi Festival Celebration</h3>
                    <p>Date: December 25, 2024</p>
                    <p>Location: Angrinon Park, Montreal</p>
                    <p>Description: Join us for a vibrant Holi celebration with colors, music, and dance! Open to all ages. Wear white and prepare to get colorful!</p>

                    <div className="holi-image-carousel">
                        <button onClick={handlePreviousHoliImage} className="carousel-btn">&lt;</button>
                        <img src={holiImages[currentHoliImageIndex]} alt="Holi Event" className="holi-image" />
                        <button onClick={handleNextHoliImage} className="carousel-btn">&gt;</button>
                    </div>

                    <div className="action-buttons">
                        <button onClick={handleLikeToggleHoli} className="like-btn" disabled={likedHoli}>
                            Like
                        </button>
                        <button onClick={handleLikeToggleHoli} className="unlike-btn" disabled={!likedHoli}>
                            Unlike
                        </button>
                        <button onClick={handleReportEventHoli} className="report-btn">
                            Report this Event
                        </button>
                    </div>

                    <div className="comments-section">
                        <h4>Comments</h4>
                        <ul className="comments-list">
                            {commentsHoli.map((comment, index) => (
                                <li key={index}>{comment}</li>
                            ))}
                        </ul>
                        <form onSubmit={handleCommentSubmitHoli} className="comment-form">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newCommentHoli}
                                onChange={(e) => setNewCommentHoli(e.target.value)}
                                required
                            />
                            <button type="submit">Post</button>
                        </form>
                    </div>
                </div>

<div className="event-card">
    <h3>Christmas Celebration</h3>
    <p>Date: December 25, 2024</p>
    <p>Location: City Square, Montreal</p>
    <p>Description: Celebrate Christmas with us! Enjoy carols, festive food, and activities for all ages. Bring your family and friends!</p>

    <div className="christmas-image-carousel">
        <button onClick={handlePreviousChristmasImage} className="carousel-btn">&lt;</button>
        <img src={christmasImages[currentChristmasImageIndex]} alt="Christmas Event" className="christmas-image" />
        <button onClick={handleNextChristmasImage} className="carousel-btn">&gt;</button>
    </div>

    <div className="action-buttons">
        <button onClick={handleLikeToggleChristmas} className="like-btn" disabled={likedChristmas}>
            Like
        </button>
        <button onClick={handleLikeToggleChristmas} className="unlike-btn" disabled={!likedChristmas}>
            Unlike
        </button>
        <button onClick={handleReportEventChristmas} className="report-btn">
            Report this Event
        </button>
    </div>

    <div className="comments-section">
        <h4>Comments</h4>
        <ul className="comments-list">
            {commentsChristmas.map((comment, index) => (
                <li key={index}>{comment}</li>
            ))}
        </ul>
        <form onSubmit={handleCommentSubmitChristmas} className="comment-form">
            <input
                type="text"
                placeholder="Add a comment..."
                value={newCommentChristmas}
                onChange={(e) => setNewCommentChristmas(e.target.value)}
                required
            />
            <button type="submit">Post</button>
        </form>
    </div>
</div>

            </div>

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

export default HomePage;
