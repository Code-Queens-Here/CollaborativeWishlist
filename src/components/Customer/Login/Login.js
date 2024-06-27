import React, { useState } from 'react';
import './Login.css'
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigation=useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form data:', formData);
    try{
      console.log("hello")
      const response=await axios.post("http://localhost:8080/user/login",formData);
      localStorage.setItem('token',response.data.token );
      console.log(response.data.token);
      const user=response.data.user;

      console.log(user._id);
  
      localStorage.setItem('id',user._id);
      setFormData({
        email: '',
        password: '',
      });
  
      navigation('/dashboard');
    }
    catch(err){
      console.log(err);
    }
  
    
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
