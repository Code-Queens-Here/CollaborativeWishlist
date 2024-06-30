import React, { useState, useEffect } from 'react';
import styles from './AllCarts.module.css';
import axios from 'axios';

const AllCarts = () => {
  const [allCarts, setAllCarts] = useState([]);
  const [allFriends, setAllFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);
  const [currentCartId, setCurrentCartId] = useState(null);

  useEffect(() => {
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    setAllCarts(carts);
  
  }, []);

  const addFriends = async (cartId) => {
    const email = prompt('Enter email to add as friend:');
    if (!email) return;

    try {
      const userId = localStorage.getItem('id');
      const response = await axios.post(`http://localhost:8080/user/addUsers/${userId}/${cartId}`, { email });
      console.log(response.data); 
      alert('Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend. Please try again.');
    }
  };

  const viewFriends = async (cartId) => {
    try {
      const userId = localStorage.getItem('id');
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }
      const response = await axios.get(`http://localhost:8080/user/getAssociatedUsers/${userId}/${cartId}`);
      console.log(response.data);
      setAllFriends(response.data.friends || []); // Assuming the friends array contains objects with id and name
      setCurrentCartId(cartId);
      setShowFriends(true);
    } catch (err) {
      console.error('Error fetching associated users:', err);
    }
  };

  const deleteFriend = async (cartId, friendId) => {
    try {
      const userId = localStorage.getItem('id');
      
      const response = await axios.post(`http://localhost:8080/user/deleteUserFromCart/${userId}/${cartId}/${friendId}`);
      console.log(response.data);
      setAllFriends(allFriends.filter(friend => friend.id !== friendId));
      alert('Friend removed successfully!');
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend. Please try again.');
    }
  };

  const deleteCart = async (cartId, cartName) => {
    try {
      const userId = localStorage.getItem('id');
      const response = await axios.delete(`http://localhost:8080/user/deleteCart/${userId}/${cartId}`);
      console.log(response.data);
      setAllCarts(allCarts.filter(cart => cart.cartId !== cartId));
      alert('Cart deleted successfully!');
    } catch (error) {
      console.error('Error deleting cart:', error);
      alert('Failed to delete cart. Please try again.');
    }
  };

  const closeFriendsList = () => {
    setShowFriends(false);
    setAllFriends([]);
  };

  return (
    <div className={styles.container}> 
      <header>
        <h1>All Wishlists</h1>
        <input type="text" id="searchBar" placeholder="Search..." />
      </header>
      <main>
        <div className={styles.cartList}>
          {allCarts.map((item, index) => (
            <div key={index} className={styles.cartItem}>
              <strong>{item.name}</strong> - {item.cartId}
              <div className={styles.btnContainer}>
                <button className={styles.button} onClick={() => viewFriends(item.cartId)}>View Friend List</button>
                <button className={styles.btn} onClick={() => addFriends(item.cartId)}>Add Friends</button>
                {item.name !== 'Default cart' && (
                  <button className={styles.btn} onClick={() => deleteCart(item.cartId)}>Delete Cart</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showFriends && (
        <div className={styles.friendsListContainer}>
          <div className={styles.friendsList}>
            <h2>Friends List</h2>
            <button className={styles.closeButton} onClick={closeFriendsList}>Close</button>
            <ul>
              {allFriends.map((friend, index) => (
                <li key={index} className={styles.list}>
                  {friend.name}
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteFriend(currentCartId, friend.Sid)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCarts;
