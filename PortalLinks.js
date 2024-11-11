import React from 'react';
import './LoginPage.css';

const PortalLinks = () => {
  return (
    <div className="portal-links">
      <a href="userhome" className="portal-link">User Portal</a>
      <a href="admins" className="portal-link">Admin Portal</a>
      <a href="ModeratorProfile" className="portal-link">Moderator Portal</a>
    </div>
  );
};

export default PortalLinks;
