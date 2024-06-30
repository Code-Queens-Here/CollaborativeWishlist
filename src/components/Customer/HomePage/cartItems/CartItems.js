import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigation=useNavigate();

  useEffect(() => {
    // Load cart items when component mounts
    getCart();
  }, []);
  const getCart = async () => {
    try {
      const cartId = localStorage.getItem('cartId');
      console.log(cartId);
      if (!cartId) {
        console.error('Cart ID not found in localStorage');
        return;
      }
  
      const response = await axios.get(`http://localhost:8080/user/cart/${cartId}`);
      const cart = response.data.cart;
  
      if (cart) {
        setCartItems(cart); // Assuming `cart` already contains `individualCarts` mapped in the backend
      } else {
        console.error('Cart not found');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };
  
  
  const getAllCarts = async () => {
    try {
      const userId = localStorage.getItem('id');
      const response = await axios.get(`http://localhost:8080/user/getAllCarts/${userId}`);
      
      // Assuming response.data.carts is an array
      const carts = response.data.carts;
      
      // Store carts array in localStorage
      localStorage.setItem('carts', JSON.stringify(carts));
      
      // Log the carts for verification
      console.log("Carts retrieved:", JSON.stringify(carts));
      
      // Navigate to '/allCarts' route
      navigation('/allCarts');
    } catch (error) {
      console.error('Error fetching carts:', error);
    }
  };

  const removeItem = async (itemId) => {
    const userId = localStorage.getItem('id');
    const cartId = localStorage.getItem('cartId');
    console.log(userId + " " + cartId);

    const response = await axios.delete(`http://localhost:8080/user/removeItemFromCart/${userId}/${cartId}/${itemId}`);
    getCart();
  }

  const handleCartButtonClick = async () => {
    try{
        const userId=localStorage.getItem('id');
        console.log("Hell0");
        const response=await axios.post(`http://localhost:8080/user/addWishlists/${userId}`);
        console.log("Hell0");
        console.log(response.data);
        getAllCarts();
    }
    catch(err){
      console.log(err);
    }
  };

  const watchFriendsCarts=async()=>{
    navigation('/friendsWishlist')
  }
  return (
    <div className="App">
      <header>
        <h1>Home Page</h1>
        {/* Example of a Cart button */}
        <button onClick={handleCartButtonClick}>Add Wishlist</button>
        <button onClick={getAllCarts}>View All Wishlists</button>
        <button onClick={watchFriendsCarts}>View Friends Carts</button>
        <input
          type="text"
          id="searchBar"
          placeholder="Search..."
        />
      </header>
      <main id="itemsContainer">
        {cartItems.map(item => (
          <div key={item.itemId} className="item">
            <h2>{item.title}</h2>
            <p>{item.content}</p>
            <img src={item.picture} alt={item.title} />
            <p>Price: Rs {item.price}</p>
            <button onClick={() => removeItem(item.itemId)}>Remove item</button>
          </div>
        ))}
      </main>
     
    </div>
  );
};

export default App;
