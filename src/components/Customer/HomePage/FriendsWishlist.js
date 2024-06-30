import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FriendsWishlist() {
  const [wishlists, setWishlists] = useState([]);

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const userId = localStorage.getItem('id');
        console.log(userId);
        const response= await axios.get(`http://localhost:8080/user/cartsSharedWithUser/${userId}`);
        if (response.data && Array.isArray(response.data.wishlists)) {
          setWishlists(response.data.wishlists);
        } else {
          setWishlists([]);
        }
      } catch (error) {
        console.error('Error fetching wishlists:', error);
        setWishlists([]);
      }
    };

    fetchWishlists();
  }, []);

  return (
    <div>
      <h1>Friends' Wishlists</h1>
      {wishlists && wishlists.length > 0 ? (
        <ul>
          {wishlists.map((wishlist) => (
            <li key={wishlist._id}>
              <h2>{wishlist.name}</h2>
              <ul>
                {wishlist.items && wishlist.items.map((item) => (
                  <li key={item._id}>{item.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No wishlists available</p>
      )}
    </div>
  );
}
