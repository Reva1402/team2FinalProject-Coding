// ModeratorReportedEvents.js
import React, { useEffect, useState } from "react";
import { db } from './firebaseConfig';  // Firebase Firestore instance
import { query, collection, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";  // For navigation

const ModeratorReportedEvents = () => {
  const [reportedEvents, setReportedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all reported events from Firestore
  useEffect(() => {
    const fetchReportedEvents = async () => {
      try {
        const q = query(collection(db, "events"), where("isReported", "==", true));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReportedEvents(eventsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching reported events: ", error);
        setIsLoading(false);
      }
    };

    fetchReportedEvents();
  }, []);

  // Handle action on a reported event (Delete or Warn)
  const handleAction = async (eventId, actionType) => {
    try {
      if (actionType === 'delete') {
        // Delete the event from Firestore
        const eventRef = doc(db, "events", eventId);
        await deleteDoc(eventRef);
        setReportedEvents(reportedEvents.filter(event => event.id !== eventId));
        alert("Event deleted successfully");
      } else if (actionType === 'warn') {
        // Here, you can update the event status or send a warning to the user
        // For example, you might add a warning field to the event
        alert("Warning issued to the event creator");
      }
    } catch (error) {
      console.error("Error processing action: ", error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading reported events...</div>;
  }

  return (
    <div className="moderator-reported-events">
      <h2>Reported Events</h2>
      {reportedEvents.length === 0 ? (
        <p>No events have been reported.</p>
      ) : (
        <table className="events-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Creator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reportedEvents.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.description}</td>
                <td>{event.createdBy}</td>
                <td>
                  <button onClick={() => handleAction(event.id, 'delete')}>Delete</button>
                  <button onClick={() => handleAction(event.id, 'warn')}>Warn</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModeratorReportedEvents;
