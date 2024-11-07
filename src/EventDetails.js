import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                console.log('Fetching event with ID:', id);


                const eventRef = doc(firestore, 'events', id);
                const eventDoc = await getDoc(eventRef);

                if (eventDoc.exists()) {

                    setEvent(eventDoc.data());
                } else {

                    setError('Event not found.');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event details:', error);
                setError('Failed to fetch event details.');
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);


    if (loading) {
        return <div>Loading event details...</div>;
    }


    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }


    return (
        <div className="container mt-5">
            <h1>{event?.name}</h1>
            <p>{event?.description}</p>
            <p><strong>Date:</strong> {event?.date}</p>
            <p><strong>Time:</strong> {event?.time}</p>
            <p><strong>Location:</strong> {event?.location}</p>
            <p><strong>Ticket Price:</strong> ${event?.ticketPrice}</p>
            <div className="event-images">
                {event?.images && event.images.length > 0 ? (
                    event.images.map((image, index) => (
                        <img key={index} src={image} alt={`Event image ${index + 1}`} className="img-fluid mb-3" />
                    ))
                ) : (
                    <p>No images available for this event.</p>
                )}
            </div>
            
        </div>
    );
};

export default EventDetails;
