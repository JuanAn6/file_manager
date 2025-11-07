import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // La instancia de Axios configurada
import { useAuth } from '../context/AuthContext'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <form onSubmit={handleSubmit}>
      {/* ... inputs for email and password ... */}
      <button type="submit">Log in</button>
    </form>
  );
}
export default Login;