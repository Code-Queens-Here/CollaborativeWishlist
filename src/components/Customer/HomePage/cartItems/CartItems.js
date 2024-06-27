import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [cartItems, setCartItems] = useState([]);

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

  const handleCartButtonClick = () => {
    // When the Cart button is clicked, fetch the cart items
    getCart();
  };

  return (
    <div className="App">
      <header>
        <h1>Home Page</h1>
        {/* Example of a Cart button */}
        <button onClick={handleCartButtonClick}>Cart</button>
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
          </div>
        ))}
      </main>
    </div>
  );
};

export default App;
