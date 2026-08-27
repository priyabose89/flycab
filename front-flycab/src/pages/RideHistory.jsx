import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function RideHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/rides');
        setRides(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load ride history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <p>Loading ride history...</p>;
  if (error) return <p className="error">{error}</p>;
  if (rides.length === 0) return <p>No rides yet. <Link to="/book">Book your first ride</Link>.</p>;

  return (
    <div className="ride-history-page">
      <h1>Your rides</h1>
      <ul className="ride-list">
        {rides.map((ride) => (
          <li key={ride.id} className={`ride-item status-${ride.status}`}>
            <Link to={`/ride/${ride.id}`}>
              <div className="ride-route">
                <span>{ride.pickup_address}</span>
                <span> → </span>
                <span>{ride.drop_address}</span>
              </div>
              <div className="ride-meta">
                <span>{ride.vehicle_type}</span>
                <span>₹{ride.fare}</span>
                <span className="status-badge">{ride.status}</span>
                <span>{new Date(ride.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}