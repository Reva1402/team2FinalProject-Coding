import React from 'react';


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">EVENTOPIA</div>
      <div className="navbar-links">
        <a href="#" className="navbar-link">Services</a>
        <a href="#" className="navbar-link">Log In</a>
        <a href="tel:+10000000000" className="navbar-link">+1 (000)-000-0000</a>
      </div>
    </nav>
  );
};

export default Navbar;