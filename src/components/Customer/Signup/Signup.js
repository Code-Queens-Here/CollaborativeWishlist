import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigation = useNavigate(); // Corrected variable name to follow conventions
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: '0', // Ensure role is initialized
  });

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

    try {
      const response = await axios.post('http://localhost:8080/user/register', formData);
      console.log('Response:', response.data); // Log response data if needed
  

      // Reset form data after successful submission
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: '0', // Ensure role is reset properly
      });
      const userCollections = response.data.user.Collections; // Accessing Collections array

      // Iterate through Collections array to find cart IDs
      const cartIds = userCollections.map(cart => cart._id);
      
      console.log('Cart IDs:', cartIds);
   
      localStorage.setItem('cartId',cartIds);
      // Redirect to login page after successful registration
      navigation('/login'); // Use navigation function correctly
      
      // Handle any further actions after successful registration
      // For example, show a success message
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error responses or display error messages to the user
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
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
        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="0">Customer</option>
            <option value="1">Seller</option>
            <option value="2">Admin</option>
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
