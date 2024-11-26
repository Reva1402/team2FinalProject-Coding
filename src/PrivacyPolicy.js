import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {  
    
    const handleLoginClick = () => {
        navigate('/login');
    };
    const navigate = useNavigate();
    return (
        <div >
            <nav className="moderator-navbar">
        <h2>Welcome to Eventopia</h2>
        <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
      </nav>
<div className="terms-content"> 
<h1>Privacy Policy for Eventopia</h1>
    <p>Eventopia is committed to protecting your privacy and ensuring that your data is handled securely and transparently. This Privacy Policy outlines how we collect, use, and protect your information when you use our platform.</p>
    
    <h2>1. Information We Collect</h2>
    <h3>1.1 Personal Information</h3>
    <p>When you register, we collect personal information such as your name, email address, and profile details.</p>
    
    <h3>1.2 Event Data</h3>
    <p>Information related to events you create, join, or interact with, including event details and attendance.</p>
    
    <h3>1.3 Usage Data</h3>
    <p>We collect data on how you use our platform, including interactions with events, comments, and user engagement.</p>
    
    <h3>1.4 Location Data</h3>
    <p>If you enable location services, we may collect your location to recommend nearby events or enhance event creation with the Google Maps API.</p>
    
    <h2>2. How We Use Your Information</h2>
    <h3>2.1 Platform Functionality</h3>
    <p>To enable account registration, event management, and social interactions. To personalize your experience by recommending events and tailoring content.</p>
    
    <h3>2.2 Communication</h3>
    <p>To send notifications about platform activities, including event updates, account changes, and important announcements.</p>
    
    <h3>2.3 Security and Moderation</h3>
    <p>To identify and prevent fraudulent activities, ensure compliance with our Terms and Conditions, and protect user safety.</p>
    
    <h2>3. Sharing Your Information</h2>
    <h3>3.1 With Other Users</h3>
    <p>Basic profile information (name, profile picture, and bio) may be visible to other users. Event-related information will be shared with event participants.</p>
    
    <h3>3.2 With Moderators and Admins</h3>
    <p>Moderators and Admins may access your data to review reports, moderate content, or handle rule violations.</p>
    
    <h3>3.3 Third-Party Services</h3>
    <p>We may share data with trusted third-party services, such as Firebase (for authentication and database management) and Google Maps API (for location-based features).</p>
    
    <h2>4. Your Data Rights</h2>
    <h3>4.1 Access and Updates</h3>
    <p>You can access and update your personal information through your profile settings.</p>
    
    <h3>4.2 Deletion</h3>
    <p>You can request the deletion of your account and associated data by contacting our support team.</p>
    
    <h3>4.3 Opt-Out</h3>
    <p>You may opt out of certain notifications or data-sharing features in your account preferences.</p>
    
    <h2>5. Data Security</h2>
    <p>We take appropriate measures to protect your data, including:</p>
    <ul>
        <li>Secure authentication and encryption for sensitive data.</li>
        <li>Regular updates to ensure compliance with security best practices.</li>
    </ul>
    
    <h2>6. Data Retention</h2>
    <p>We retain your information as long as your account is active or as necessary to fulfill platform purposes. Data may also be retained to comply with legal obligations or resolve disputes.</p>
    
    <h2>7. Children’s Privacy</h2>
    <p>Eventopia is not intended for users under the age of 13. We do not knowingly collect personal information from children. If we discover such data has been collected, it will be promptly deleted.</p>
    
    <h2>8. Changes to this Privacy Policy</h2>
    <p>We may update this Privacy Policy periodically. Significant changes will be communicated via email or platform notifications. Continued use of the platform constitutes acceptance of these changes.</p>
    
    <h2>9. Contact Us</h2>
    <p>If you have questions or concerns about this Privacy Policy or how your data is handled, contact us at:</p>
    <p><strong>Email:</strong> support@eventopia.com</p>
    
    <p>Thank you for trusting Eventopia with your information. We’re dedicated to creating a secure and engaging platform for your community interactions.</p>
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

export default PrivacyPolicy;