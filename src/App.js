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
import Admincontentmanagement from './Admincontentmanagement';
import ModeratorManagement from './ModeratorManagement';
import ModeratorDashboard from './ModeratorDashboard';
import AdminEditProfile from './AdminEditProfile';
import ModeratorUserManagement from './ModeratorUserManagement';
import ModeratorProfile from './ModeratorProfile';
import AddModerator from './AddModerator';
import ModeratorCommentManagement from './ModeratorCommentManagement';
import AdminProfile from './AdminProfile';
import Navbar from './Navbar';
import Header from './Header';
import Footer from './Footer';
import ForgotPassword from './ForgotPassword';
import ReportContent from './reportContent'; 
import SuspendedResources from './SuspendedResources';
import ModeratorEventManagement from './ModeratorEventManagement';
import AdminModeratorUserProfile from './AdminModeratorUserProfile';
import Followers from './Followers';
import AddUser from './AddUser';
import ContactUs from './ContactUs';
import Adminsupport from './Adminsupport';
import AdminModeratorEventView from './AdminModeratorEventView';
import Services from './Services';
import MySchedule from './MySchedule';
import '@fortawesome/fontawesome-free/css/all.min.css';
import FilterEvents from './FilterEvents';
import About from './About';
import TermsConditions from './TermsConditions';
import PrivacyPolicy from './PrivacyPolicy';
import ModeratorEditProfile from './ModeratorEditProfile';




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
      <Route path="users" element={<UserManagement />} />
      <Route path="createevent" element={<CreateEvent />} />
      <Route path="MyEvents" element={<MyEvents />} />
      <Route path="editevent/:id" element={<EditEvent />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="AdminDashboard" element={<AdminDashboard />} />
      <Route path="AddModerator" element={<AddModerator />} />
      <Route path="AddUser" element={<AddUser />} />
      <Route path="moderatormanagement" element={<ModeratorManagement />} />
      <Route path="ModeratorProfile" element={<ModeratorProfile />} />
      <Route path="ModeratorHomePage" element={<ModeratorHomePage />} />
      <Route path="AdminProfile" element={<AdminProfile />} />
      <Route path="Admincontentmanagement" element={<Admincontentmanagement />} />
      <Route path="ModeratorCommentManagement" element={<ModeratorCommentManagement />} />
      <Route path="ModeratorEventManagement" element={<ModeratorEventManagement />} />
      <Route path="Navbar" element={<Navbar />} />
      <Route path="Header" element={<Header />} />
      <Route path="Footer" element={<Footer />} />
      <Route path="ForgotPassword" element={<ForgotPassword />} />
      <Route path="ModeratorDashboard" element={<ModeratorDashboard />} />
      <Route path="AdminEditProfile" element={<AdminEditProfile />} />
      <Route path="ModeratorUserManagement" element={<ModeratorUserManagement />} />
      <Route path="/attendevent/:eventId" element={<EventAttendance />} />
      <Route path="/reportContent/:reporterId/:eventId" element={<ReportContent />} />
      <Route path="/reportContent/:eventId/:commentId/:reporterId/:commenterId" element={<ReportContent />} />
      <Route path='/suspendedresources' element={<SuspendedResources />} />
      <Route path="Followers" element={<Followers />} />
      <Route path="/adminModeratorUserProfile/:userId" element={<AdminModeratorUserProfile />} />
      <Route path="/adminModeratorEventView/:eventId" element={<AdminModeratorEventView />} />
      <Route path="contactus" element={<ContactUs />} />
      <Route path="adminSupport" element={<Adminsupport />} />
      <Route path="search" element={<handleSearch />} />
      <Route path="services" element={<Services />} />
      <Route path="mySchedule" element={<MySchedule />} />
      <Route path = "filterEvents" element={<FilterEvents />} />
      <Route path="/about" element={<About />} />
      <Route path="/termsandconditions" element={<TermsConditions />} />
      <Route path="/privacypolicy" element={<PrivacyPolicy/>}/>
      <Route path="/moderatoreditprofile" element={<ModeratorEditProfile />} />
      </Routes>
      </Router>
    </div>
    
  );
}

export default App;
