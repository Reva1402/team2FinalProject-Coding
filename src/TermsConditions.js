import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import "./TermsConditions.css";

const TermsConditions = () => {  
    
    const handleLoginClick = () => {
        navigate('/login');
    };
    const navigate = useNavigate();
    return (
        <div>
            <div className="about-container">
             <nav className="moderator-navbar">
        <h2>Welcome to Eventopia</h2>
        <button className="logout-button" onClick={() => signOut(auth).then(() => navigate('/login'))}>Logout</button>
      </nav>

        <div className="about-container">
             
<div className="terms-content"> 
            <h1> Terms and Conditions </h1>
            Terms and Conditions for Eventopia
Welcome to Eventopia! By using our platform, you agree to comply with and be bound by the following terms and conditions. Please read these carefully before accessing or using our services.

<h2>1. Acceptance of Terms</h2>
By registering for an account or using Eventopia, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. If you do not agree, please refrain from using our platform.

<h2>2. User Responsibilities</h2>
<h4>2.1 Account Registration</h4>
Users must provide accurate and up-to-date information during registration.
Users are responsible for maintaining the confidentiality of their login credentials.
<h4>2.2 Content Sharing</h4>
Users must ensure that all content shared (events, comments, etc.) complies with community standards and does not include offensive, illegal, or harmful material.
Eventopia reserves the right to remove any content that violates these terms.
<h4>2.3 Reporting</h4>
Users are encouraged to report inappropriate or abusive content through the provided reporting tools.
<h2>3. Roles and Responsibilities</h2>
<h4>3.1 Users</h4>
Users can create, join, and interact with events responsibly.
Users must respect other community members and adhere to platform rules.
<h4>3.2 Moderators</h4>
Moderators are responsible for reviewing flagged content and enforcing platform guidelines.
Moderators may issue warnings, suspend users, or remove content as necessary.
<h4>3.3 Administrators</h4>
Admins have full control over user accounts, database settings, and platform rules.
Admins may suspend or delete accounts for serious or repeated violations.
<h2>4. Prohibited Activities</h2>
The following activities are strictly prohibited:

Posting offensive, discriminatory, or illegal content.
Misusing the reporting system to harass other users.
Attempting to bypass platform security measures.
<h2>5. Privacy and Data Security</h2>
Eventopia values your privacy and ensures your data is handled in compliance with relevant laws.
Please refer to our Privacy Policy for detailed information on data usage and protection.
<h2>6. Limitation of Liability</h2>
Eventopia is not liable for:

Issues arising from user-generated content, including offensive or inappropriate material.
Events that are canceled, mismanaged, or otherwise not as advertised.
<h2>7. Termination of Service</h2>
Eventopia reserves the right to terminate or restrict user accounts for violations of these Terms and Conditions.

<h2>8. Changes to Terms and Conditions</h2>
Eventopia may update these Terms and Conditions from time to time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the revised terms.

<h2>9. Contact Information</h2>
If you have questions about these Terms and Conditions, please contact us at support@eventopia.com.
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
        </div>
        </div>
    );
};  

export default TermsConditions;