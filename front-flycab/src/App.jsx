import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import BookRide from './pages/BookRide';
import RideStatus from './pages/RideStatus';
import RideHistory from './pages/RideHistory';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book" element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
      <Route path="/ride/:id" element={<ProtectedRoute><RideStatus /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><RideHistory /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/book" />} />  
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}