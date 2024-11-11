import logo from './logo.svg';
import './App.css';
import WelcomePage from './WelcomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './UserHomePage';
import UserProfile from './userProfile';
import UserEditProfile from './UserEditProfile';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import CreateEvent from './CreateEvent';
import EventAttendance from './EventAttendance';
import EditEvent from './EditEvent';
import EventDetails from './EventDetails';
import MyEvents from './MyEvents';
import ModeratorHomePage from './ModeratorHomePage';
import ModeratorProfile from './ModeratorProfile';

function App() {
  return (
    <div>
      <Router>
      <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="userhomepage" element={<HomePage />} />
      <Route path="viewprofile" element = {<UserProfile />} />
      <Route path="editprofile" element={<UserEditProfile />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="usermanagement" element={<UserManagement />} />
      <Route path="createevent" element={<CreateEvent />} />
      {/* <Route path="/event/:eventId" element={<EventDetails />} /> */}
      <Route path="editevent/:id" element = {<EditEvent />} />
      <Route path="eventdetails/:id" element = {<EventDetails />} />
      <Route path="myevents" element = {<MyEvents />} />
      <Route path="moderatorhomepage" element={<ModeratorHomePage />} />
      <Route path="/moderator/profile" element={<ModeratorProfile />} />
      </Routes>
      </Router>
    </div>
  );
}

export default App;
