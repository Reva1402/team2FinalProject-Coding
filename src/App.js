import logo from './logo.svg';
import './App.css';
import WelcomePage from './WelcomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './UserHomePage';
import UserProfile from './UserProfile';
import UserEditProfile from './UserEditProfile';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CreateEvent from './CreateEvent';
import EditEvent from './EditEvent';
import MyEvents from './MyEvents';
import EventAttendance from './EventAttendance';
import EventDetails from './EventDetails';

import ModeratorHomePage from './ModeratorHomePage';
import ModeratorManagement from './ModeratorManagement';
import ModeratorProfile from './ModeratorProfile';
import AddModerator from './AddModerator';


import AdminProfile from './AdminProfile';

import Navbar from './Navbar';
import Header from './Header';
import Footer from './Footer';
import ForgotPassword from './ForgotPassword';


function App() {
  return (
    <div>
      <Router>
      <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="userhomepage" element={<HomePage />} />
      <Route path="UserProfile" element={<UserProfile />} />
      <Route path="UserEditProfile" element={<UserEditProfile />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="usermanagement" element={<UserManagement />} />
      <Route path="createevent" element={<CreateEvent />} />
      <Route path="MyEvents" element={<MyEvents />} />
      <Route path="/event/:eventId" element={<EventAttendance />} />
      <Route path="EditEvent" element={<EditEvent />} />
      <Route path="EventDetails" element={<EventDetails />} />

      <Route path="AddModerator" element={<AddModerator />} />
      
      <Route path="ModeratorManagement" element={<ModeratorManagement />} />
      <Route path="ModeratorProfile" element={<ModeratorProfile />} />
      <Route path="ModeratorHomePage" element={<ModeratorHomePage />} />

      <Route path="AdminProfile" element={<AdminProfile />} />
      
      <Route path="Navbar" element={<Navbar />} />
      <Route path="Header" element={<Header />} />
      <Route path="Footer" element={<Footer />} />
      <Route path="ForgotPassword" element={<ForgotPassword />} />
      </Routes>
      </Router>
    </div>
  );
}

export default App;
