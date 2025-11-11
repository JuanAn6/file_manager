import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext'; 
import '../styles/Login.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setshowPassword] = useState('password');

  const { login } = useAuth(); // Función para guardar el token globalmente
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      const authToken = response.data.token; 
      login(authToken); // Save the token in the global and localStorage states
      
      navigate('/'); // Redirect the user to the (protected) homepage

    } catch (error) {
      console.error("Error in login:", error.response.data);
      alert("Not valid credentials.");
    }
  };

  const handleShowPassword = (e) => {
    if(showPassword == 'password'){
      setshowPassword('text');
    }else{
      setshowPassword('password');
    }
  }

  return (
    <div className='login-container'>
      <div className='login-box'>
        <h2>File manager</h2>
        <form onSubmit={handleSubmit} className='login-form'>
          <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type={showPassword} name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className='button-container'>
            <button type="button" onClick={handleShowPassword}>Show password</button>
            <button type="submit">Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Login;