import React, { useState, useEffect } from 'react';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const App = () => {
    const [items, setItems] = useState([]);
    const navigation = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            console.log("Fetching items...");
            const response = await axios.get('http://localhost:8080/item/getItems');
            const data = response.data;
            console.log(data);
            setItems(data.items);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const getCart = async () => {
        navigation('/cart');
    };

    const addToCart = async (itemId) => {
        try {
            const userId = localStorage.getItem('id');
            const cartId = localStorage.getItem('cartId');
            const quantity = 1;
    
            if (!userId || !cartId) {
                console.error('User ID or Cart ID is missing from localStorage');
                // Handle the missing IDs scenario (e.g., show error message)
                return;
            }
            console.log(userId + " " + cartId);
            const response = await axios.post(
              `http://localhost:8080/user/addToCart/${userId}/${cartId}`,
              {
                  itemId: itemId,
                  quantity: quantity
              }
          );
  
            console.log("hello")
            // Assuming the addToCart endpoint returns a success message or confirmation
            if (response.status === 200) {
                window.prompt('Item Added successfully');
                // Optionally, you may want to update UI or perform further actions after successful addition
            } else {
                console.error('Failed to add item to cart:', response.data.message);
                // Handle the failure scenario (e.g., show error message to the user)
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            // Handle error responses or display error messages to the user
        }
    };

    return (
        <div className="App">
            <header>
                <h1>Home Page</h1>
                <input
                    type="text"
                    id="searchBar"
                    placeholder="Search..."
                />
                <button className="cartButton" onClick={getCart}>Cart</button>
            </header>
            <main id="itemsContainer">
                {items.map(item => (
                    <div key={item._id} className="item">
                        <h2>{item.title}</h2>
                        <p>{item.content}</p>
                        <img src={item.picture} alt={item.title} />
                        <p>Price: Rs {item.price}</p>
                        <button onClick={() => addToCart(item._id)}>Add to Cart</button>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default App;
