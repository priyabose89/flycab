import { createContext,useContext,useState } from "react";
import api from '../api/axios';

const AuthContext = createContext(null);

// get user data from the local storage 
export function AuthProvider({children}){
    const[user,setUser] = useState(()=>{
        const stored = localStorage.getItem('flycab_user');
        return stored?JSON.parse(stored):null;
    });


//  after login user data is set in the local storage 
const login = async (email, password) => {
   const res = await api.post('/login',{email,password}); 
   localStorage.setItem('flycab_token',res.data.token);
   localStorage.setItem('flycab_user',JSON.stringify(res.data.user));
   setUser(res.data.user);   
}

// after register 
 const register = async (name, email, phone, password) => {
    const res = await api.post('/register', { name, email, phone, password });
    localStorage.setItem('flycab_token', res.data.token);
    localStorage.setItem('flycab_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  // logout will remove the local storage data 
  const logout =()=>{
    localStorage.removeItem('flycab_token');
    localStorage.removeItem('flycab_user');
    setUser(null);
  }

   return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);