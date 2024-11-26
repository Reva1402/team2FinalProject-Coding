import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import './About.css';

const About = () => {  
    
    const handleLoginClick = () => {
        navigate('/login');
    };
    const navigate = useNavigate();
    return (
        
        <div className="about-container">
             <nav className="moderator-navbar">
        <h2>Welcome to Eventopia</h2>
        <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
      </nav>
<div className="about-content">
            <h1> About Page </h1>
            About Eventopia
Welcome to Eventopia!
Our platform is designed to bring communities together, enabling users to discover, organize, and participate in local events with ease. Eventopia fosters meaningful connections by encouraging engagement in neighborhood activities while maintaining a secure and inclusive environment for everyone.
<br></br>
<h2>Our Mission</h2>
At Eventopia, our mission is to inspire community engagement by providing a user-friendly platform for event creation and participation. We strive to promote a sense of belonging and collaboration while ensuring the safety and well-being of all users.
<br></br>
<h2>What We Offer</h2>
Eventopia simplifies event management and interaction through features tailored for different user roles:
<h2>Users:</h2>

Easily register, create profiles, and explore events.
Organize or join events and interact with others through likes and comments.
<h2>Moderators:</h2>

Monitor and manage community content.
Handle reports, issue warnings, and ensure a positive user experience.
<h2>Administrators:</h2>

Oversee all user activities and platform settings.
Manage user accounts, moderate content, and analyze system performance.<br></br>
<h2>Technology at the Core</h2>
Eventopia is built using cutting-edge technologies to deliver a seamless experience:

Front-End: React.js, HTML, CSS
Back-End: Firebase for authentication, database management, and real-time updates
Testing: JUnit for unit testing and Selenium for integration testing
Google Maps API: Enhancing events with precise location services<br></br>
<h2>Our Values</h2>
Community: Encouraging participation and collaboration among users.
Safety: Providing tools to report and moderate inappropriate content.
Reliability: Ensuring consistent and smooth platform performance.
Inclusivity: Creating a space where everyone feels welcome to connect and contribute.

Eventopia is the result of collaborative effort by:

<h2>Join Us</h2>
Whether you want to organize events, meet like-minded people, or contribute to a thriving community, Eventopia is here to make it happen. Together, let’s turn ideas into memorable experiences! 
</div>
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

export default About;