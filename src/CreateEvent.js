import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "./firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import "./Styling.css";

const CreateEvent = () => {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [eventImages, setEventImages] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

 
  const handleImageChange = (e) => {
    setEventImages(Array.from(e.target.files)); 
  };

  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); 
      reader.onerror = reject; 
      reader.readAsDataURL(file); 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName || !eventDate || !eventTime || !eventLocation || ticketPrice === "") {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const imageBase64List = [];

      console.log("Converting images to base64...");
      for (const image of eventImages) {
        
        const base64String = await convertToBase64(image);
        imageBase64List.push(base64String); 
      }
      console.log("All images converted to base64:", imageBase64List);

      const newEvent = {
        name: eventName,
        date: eventDate,
        time: eventTime,
        location: eventLocation,
        description: eventDescription,
        ticketPrice: parseFloat(ticketPrice),
        createdBy: auth.currentUser.uid, 
        images: imageBase64List, 
      };

      console.log("Creating event with base64 images:", imageBase64List);
      await addDoc(collection(firestore, "events"), newEvent); 

     
      setEventName("");
      setEventDate("");
      setEventTime("");
      setEventLocation("");
      setEventDescription("");
      setTicketPrice("");
      setEventImages([]);
      setSuccessMessage("Event created successfully!");

     
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/userhomepage");
      }, 2000);
    } catch (error) {
     
      console.error("Error creating event:", error);
      setError("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Create Event</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="eventName">Event Name</label>
          <input
            type="text"
            className="form-control"
            id="eventName"
            placeholder="Enter event name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventDate">Event Date</label>
          <input
            type="date"
            className="form-control"
            id="eventDate"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventTime">Event Time</label>
          <input
            type="time"
            className="form-control"
            id="eventTime"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventLocation">Event Location</label>
          <input
            type="text"
            className="form-control"
            id="eventLocation"
            placeholder="Enter event location"
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventDescription">Event Description</label>
          <textarea
            className="form-control"
            id="eventDescription"
            rows="4"
            placeholder="Enter event description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="ticketPrice">Ticket Price ($)</label>
          <input
            type="number"
            className="form-control"
            id="ticketPrice"
            placeholder="Enter ticket price"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventImages">Event Images</label>
          <input
            type="file"
            className="form-control"
            id="eventImages"
            multiple
            onChange={handleImageChange} 
          />
          {eventImages.length > 0 && (
            <ul>
              {Array.from(eventImages).map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
