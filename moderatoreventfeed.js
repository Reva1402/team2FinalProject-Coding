import React, { useEffect, useState } from "react";
import { db, auth, onAuthStateChanged, query, collection, where, getDocs } from './firebaseConfig';  // Import db from firebaseConfig

const ModeratorEventFeed = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserRole(user.uid);
      } else {
        // Redirect to login if user is not authenticated
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUserRole = async (userId) => {
    try {
      const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", userId)));
      const userData = userDoc.docs[0]?.data();
      setUserRole(userData?.role);
      if (userData?.role === "moderator") {
        fetchEvents();
      } else {
        // Redirect to home if not a moderator
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error fetching user role: ", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"), where("reported", "==", true));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => doc.data());
      setEvents(fetchedEvents);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching events: ", error);
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Moderator Event Feed</h2>
      {events.length === 0 ? (
        <p>No events need moderation at the moment.</p>
      ) : (
        events.map((event, index) => (
          <div key={index} className="event-card">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <img src={event.image} alt={event.title} />
            <div>
              <button>Review</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ModeratorEventFeed;

