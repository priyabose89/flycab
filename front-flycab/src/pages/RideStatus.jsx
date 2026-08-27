import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_LABELS = {
  requested: 'Looking for a driver...',
  accepted: 'Driver on the way',
  ongoing: 'Ride in progress',
  completed: 'Ride completed',
  cancelled: 'Ride cancelled',
};

export default function RideStatus() {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let intervalId;

    const fetchRide = async () => {
      try {
        const res = await api.get(`/rides/${id}`);
        setRide(res.data);

        // Stop polling once the ride reaches a final state
        if (['completed', 'cancelled'].includes(res.data.status)) {
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load ride status');
        clearInterval(intervalId);
      }
    };

    fetchRide(); // fetch immediately on mount
    intervalId = setInterval(fetchRide, 4000); // then poll every 4s

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!ride) return <p>Loading ride...</p>;

  return (
    <div className="ride-status-page">
      <h1>Ride #{ride.id}</h1>

      <div className={`status-banner status-${ride.status}`}>
        {STATUS_LABELS[ride.status] || ride.status}
      </div>

      <div className="ride-details">
        <p><strong>Pickup:</strong> {ride.pickup_address}</p>
        <p><strong>Drop:</strong> {ride.drop_address}</p>
        <p><strong>Vehicle:</strong> {ride.vehicle_type}</p>
        <p><strong>Fare:</strong> ₹{ride.fare}</p>
      </div>

      {['completed', 'cancelled'].includes(ride.status) && (
        <Link to="/book">Book another ride</Link>
      )}
    </div>
  );
}