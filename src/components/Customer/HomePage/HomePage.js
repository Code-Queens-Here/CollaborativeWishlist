import React, { useState, useEffect } from 'react';
import './HomePage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const App = () => {
    const [items, setItems] = useState([]);
    const [friendsCarts, setFriendsCarts] = useState([]);
    const [selfCarts, setSelfCarts] = useState([]);
    const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('http://localhost:8080/item/getItems');
            setItems(response.data.items || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const getCart = () => {
        navigate('/cart');
    };

    const getAllPossibleCarts = async (userId) => {
        try {
            const responseFriends = await axios.get(`http://localhost:8080/user/cartsSharedWithUser/${userId}`);
            setFriendsCarts(responseFriends.data.carts || []);
            console.log(responseFriends.data.carts);

            const responseSelf = await axios.get(`http://localhost:8080/user/myAllWishlists/${userId}`);
            setSelfCarts(responseSelf.data.data || []); // Ensure correct data path
        } catch (error) {
            console.error('Error fetching carts:', error);
            setFriendsCarts([]);
            setSelfCarts([]);
        }
    };

    const addToCart = async (itemId, type) => {
        try {
            const userId = localStorage.getItem('id');
            if (!userId) {
                console.error('User ID is missing from localStorage');
                return;
            }

            setSelectedItemId(itemId);
            console.log(`Selected item ID: ${itemId}`);
            await getAllPossibleCarts(userId);
            console.log('Opening dropdown...');
            setDropdownIsOpen(true); // Ensure this line is executed and updates state
        } catch (error) {
            console.error('Error initiating add to cart:', error);
        }
    };

    const selectCart = async (cartId) => {
        try {
            const userId = localStorage.getItem('id');
            const itemId = selectedItemId;
            const quantity = 1;

            if (!userId || !cartId) {
                console.error('User ID or Cart ID is missing from localStorage');
                return;
            }

            const friendResponse = await axios.get(`http://localhost:8080/user/getFriendsId/${userId}/${cartId}`);
            const friendId = friendResponse.data.friend;

            const response = await axios.post(
                `http://localhost:8080/user/addItemsToFriendsWishlist/${userId}/${friendId}/${cartId}`,
                { itemId, quantity }
            );

            if (response.status === 200) {
                alert('Item Added successfully');
            } else {
                console.error('Failed to add item to cart:', response.data.message);
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
        } finally {
            setDropdownIsOpen(false);
        }
    };

    const selfCart = async (itemId) => {
        try {
            const userId = localStorage.getItem('id');
            if (!userId) {
                console.error('User ID is missing from localStorage');
                return;
            }

            const cartId = localStorage.getItem('cartId');
            const quantity = 1;

            if (!cartId) {
                console.error('Cart ID is missing from localStorage');
                return;
            }

            const response = await axios.post(
                `http://localhost:8080/user/addToCart/${userId}/${cartId}`,
                { itemId, quantity }
            );

            if (response.status === 200) {
                alert('Item added to your cart successfully');
            } else {
                console.error('Failed to add item to your cart:', response.data.message);
            }
        } catch (error) {
            console.error('Error adding item to your cart:', error);
        }
    };

    return (
        <div className="App">
            <header>
                <h1>Home Page</h1>
                <input type="text" id="searchBar" placeholder="Search..." />
                <button className="cartButton" onClick={getCart}>Cart</button>
            </header>
            <main id="itemsContainer">
                {items.length === 0 && <h1>Nothing to display</h1>}
                {items.map(item => (
                    <div key={item._id} className="item">
                        <h2>{item.title}</h2>
                        <p>{item.content}</p>
                        <img src={item.picture} alt={item.title} />
                        <p>Price: Rs {item.price}</p>
                        <div>
                            <button onClick={() => addToCart(item._id, 'friends')}>Add to  Wishlists</button>
                            {/* <button onClick={() => addToCart(item._id, 'self')}>Add to Self Wishlist</button> */}
                        </div>
                    </div>
                ))}
                {dropdownIsOpen && (
                    <div className="dropdown">
                        <h3>Select a Wishlist</h3>
                        <div>
                            <h4>Friends' Wishlist</h4>
                            {friendsCarts.length === 0 ? (
                                <p>No friends' wishlist available.</p>
                            ) : (
                                friendsCarts.map(cart => (
                                    <div key={cart.id} className="cart-option">
                                        <p>{cart.name}</p>
                                        <button onClick={() => selectCart(cart.id)}>Select</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div>
                            <h4>Self Wishlists</h4>
                            {selfCarts.length === 0 ? (
                                <p>No self wishlist available.</p>
                            ) : (
                                selfCarts.map(cart => (
                                    <div key={cart.id} className="cart-option">
                                        <p>{cart.name}</p>
                                        <button onClick={() => selfCart(cart.id)}>Select</button>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => setDropdownIsOpen(false)}>Close</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
