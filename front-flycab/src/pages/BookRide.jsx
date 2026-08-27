import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const VEHICLE_TYPES = [
  { id: 'mini', label: 'Mini', seats: 4 },
  { id: 'sedan', label: 'Sedan', seats: 4 },
  { id: 'xl', label: 'XL', seats: 6 },
];

export default function BookRide() {
  const [pickup, setPickup] = useState({ address: '', lat: '', lng: '' });
  const [drop, setDrop] = useState({ address: '', lat: '', lng: '' });
  const [vehicleType, setVehicleType] = useState('mini');
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const canEstimate = pickup.lat && pickup.lng && drop.lat && drop.lng;

  const getEstimate = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/rides/estimate', {
        pickup_lat: parseFloat(pickup.lat),
        pickup_lng: parseFloat(pickup.lng),
        drop_lat: parseFloat(drop.lat),
        drop_lng: parseFloat(drop.lng),
        vehicle_type: vehicleType,
      });
      setFare(res.data.fare);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not get fare estimate');
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/rides', {
        pickup_address: pickup.address,
        pickup_lat: parseFloat(pickup.lat),
        pickup_lng: parseFloat(pickup.lng),
        drop_address: drop.address,
        drop_lat: parseFloat(drop.lat),
        drop_lng: parseFloat(drop.lng),
        vehicle_type: vehicleType,
      });
      navigate(`/ride/${res.data.ride_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not book ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-ride-page">
      <h1>Book a ride</h1>

      <label>Pickup address</label>
      <input
        value={pickup.address}
        onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
        placeholder="e.g. Anna Nagar, Chennai"
      />
      <div className="latlng-row">
        <input placeholder="lat" value={pickup.lat} onChange={(e) => setPickup({ ...pickup, lat: e.target.value })} />
        <input placeholder="lng" value={pickup.lng} onChange={(e) => setPickup({ ...pickup, lng: e.target.value })} />
      </div>

      <label>Drop address</label>
      <input
        value={drop.address}
        onChange={(e) => setDrop({ ...drop, address: e.target.value })}
        placeholder="e.g. Chennai Central Station"
      />
      <div className="latlng-row">
        <input placeholder="lat" value={drop.lat} onChange={(e) => setDrop({ ...drop, lat: e.target.value })} />
        <input placeholder="lng" value={drop.lng} onChange={(e) => setDrop({ ...drop, lng: e.target.value })} />
      </div>

      <label>Ride type</label>
      <div className="vehicle-options">
        {VEHICLE_TYPES.map((v) => (
          <button
            key={v.id}
            type="button"
            className={vehicleType === v.id ? 'selected' : ''}
            onClick={() => { setVehicleType(v.id); setFare(null); }}
          >
            {v.label} · {v.seats} seats
          </button>
        ))}
      </div>

      <button type="button" onClick={getEstimate} disabled={!canEstimate || loading}>
        {loading ? 'Checking...' : 'Get Fare Estimate'}
      </button>

      {fare !== null && (
        <div className="fare-result">
          <p>Estimated fare: ₹{fare}</p>
          <button type="button" onClick={bookRide} disabled={loading}>
            {loading ? 'Booking...' : `Book ${vehicleType}`}
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}