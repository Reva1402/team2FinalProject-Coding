// AdminEventView.js
import React, { useEffect, useState } from "react";
import { db, auth, onAuthStateChanged, collection, getDocs, query, where } from './firebaseConfig';  // Make sure to import Firestore functions from firebaseConfig
import { doc, deleteDoc } from "firebase/firestore";  // Import doc and deleteDoc from firebase/firestore
import { useNavigate } from "react-router-dom";  // Use useNavigate for navigation in React Router v6

const AdminEventView = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();  // useNavigate hook

  // On component mount, check the user's authentication and role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        checkUserRole(user.uid);
      } else {
        navigate("/login");  // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();  // Clean up the subscription when component unmounts
  }, [navigate]);

  // Fetch user role from Firestore
  const checkUserRole = async (userId) => {
    try {
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", userId)));
      const userData = userDoc.docs[0]?.data();
      setUserRole(userData?.role);
      if (userData?.role !== "admin") {
        navigate("/");  // Redirect to home if not an admin
      } else {
        fetchAllEvents();  // If admin, fetch all events
      }
    } catch (error) {
      console.error("Error fetching user role: ", error);
    }
  };

  // Fetch all events from Firestore
  const fetchAllEvents = async () => {
    try {
      const q = query(collection(db, "events"));
      const querySnapshot = await getDocs(q);
      const eventsData = querySnapshot.docs.map((doc) => doc.data());
      setEvents(eventsData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events: ", error);
      setIsLoading(false);
    }
  };

  // Render loading message while data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the list of events if available
  return (
    <div>
      <h2>Admin - All Events</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td>{event.title}</td>
                <td>{event.description}</td>
                <td>{event.location}</td>
                <td>{event.createdBy}</td>
                <td>
                  <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Example function to handle event deletion
  const handleDeleteEvent = async (eventId) => {
    try {
      // Deleting the event document from Firestore
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);  // `deleteDoc` is a Firestore method to delete a document
      fetchAllEvents();  // Refresh events list after deletion
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event: ", error);
    }
  };
};

export default AdminEventView;
