import { useState } from "react";
import {useNavigate,Link} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function login(){
    const[email,setEmail]=useState('');
    const[password,setPassword]=useState('');
    const[error,setError]=useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        try{
            await login(email,password);
            navigate('/book');
        }catch(err){
            setError(err.reponse?.data?.error || 'Login Failed');

        }

    }; 

    return(
         <div className="auth-page">
            <h1>Log in to FlyCab</h1>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                {error && <p className="error">{error}</p>}

                <button type="submit">Log In</button>
            </form>
            <p>No account? <Link to="/register">Register</Link></p>
         </div>
    );
}