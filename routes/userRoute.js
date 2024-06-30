const express = require("express");
const mongoose = require("mongoose");
const Router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authenticateToken = require("../controller/authController");
const Item = require("../models/itemModel");

const app=express();
const cors=require('cors')
dotenv.config();

app.use(cors());
const jwtSecret = process.env.JWT_SECRET;
// Router.use(bodyParser.json());
dotenv.config();

//registeration of a new user
Router.post("/register", async (req, res) => {
  const { email, name, phone, password, address, role, cart } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Define a default cart structure
    const defaultCart = {
      individualCarts: [], // You can initialize with empty individual carts
      sharedWith: [], // Initialize with no shared users
      cartType: 'Private', // Default cart type
      name:'Default cart'
    };

    // Create a new User instance with default cart

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      role,
      Collections: [defaultCart], // Assign default cart to Collections array
      associatedUsers: [] // Initialize with no associated users
    });

    await newUser.save();
    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//login by user
Router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
  

      const existing = await User.findOne({ email });
      if (!existing) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, existing.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const payload = {
        id: existing._id,
        email: existing.email,
        name: existing.name,
        role: existing.role,
      };

      const newToken = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

      return res
        .status(200)
        .json({ message: "Login successful", token: newToken, user: existing });
    
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


//get user info
Router.get("/getUser/:userId",async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user found, return user details
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//update user details
Router.put("/updateDetails",authenticateToken, async (req, res) => {
  const { email, name, phone, password, address, role, cart } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email }, // Filter to find the user by email
      { name, phone, password, address, role, cart }, // Fields to update
      { new: true, runValidators: true } // Options: return the updated document and run schema validators
    );

    if (updatedUser) {
      return res.status(200).json({
        message: "User details updated successfully",
        user: updatedUser,
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//delete user
Router.delete("/deleteUser", authenticateToken,async (req, res) => {
  const { email } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      await User.deleteOne({ email });
      return res.status(200).json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//for adding multiple wishlists to the account
Router.post("/addWishlists/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // if (!id.isValid(id.trim())) {
    //   return res.status(400).json({ message: "Invalid user ID format" });
    // }

    const existingUser = await User.findById(id.trim());
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Assuming you want to add a new cart object to the Collections array
    const newCart = {}; // Define your cart structure here
    existingUser.Collections.push(newCart);

    await existingUser.save();
    return res.status(200).json({
      message: "Cart created successfully",
      collections: existingUser.Collections,
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: "An error occurred while adding to the wishlist" });
  }
});

//deleting any wihslist 
Router.delete("/deleteCart/:userId/:cartId", async (req, res) => {
  const { userId, cartId } = req.params;

  try {
    // Find existing user by ID
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the cart in the collections array
    const cartIndex = existingUser.Collections.findIndex(cart => cart._id.toString() === cartId);
    if (cartIndex === -1) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove the cart from collections array
    existingUser.Collections.splice(cartIndex, 1);

    // Save the updated user document
    await existingUser.save();

    return res.status(200).json({
      message: "Cart deleted successfully",
      collections: existingUser.Collections,
    });
  } catch (error) {
    console.error("Error deleting cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



//for adding items to a specific cart
Router.post("/addToCart/:userid/:cartid", async (req, res) => {
  const { userid, cartid } = req.params;
  const { itemId, quantity } = req.body;

  try {
    const existingUser = await User.findById(userid);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartIndex = existingUser.Collections.findIndex(
      (collectionItem) => collectionItem._id.toString() === cartid
    );
    if (cartIndex === -1) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the item already exists in the cart
    const itemIndex = existingUser.Collections[cartIndex].individualCarts.findIndex(
      (item) => item.itemId.toString() === itemId
    );

    if (itemIndex !== -1) {
      // If item exists, increase the quantity
      existingUser.Collections[cartIndex].individualCarts[itemIndex].quantity += parseInt(quantity);
    } else {
      // If item does not exist, add it to the cart
      const newItem = {
        itemId: new mongoose.Types.ObjectId(itemId),
        quantity: parseInt(quantity),
      };
      existingUser.Collections[cartIndex].individualCarts.push(newItem);
    }

    await existingUser.save();

    res.status(200).json({
      message: "Item added to cart successfully",
      cart: existingUser.Collections[cartIndex],
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//deleting any item 
Router.delete("/deleteItem/:userid/:cartid/:itemid", async (req, res) => {
  const { userid, cartid, itemid } = req.params;

  try {
    // Find existing user by ID
    const existingUser = await User.findById(userid);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find cart by cartid in user's collections
    const cartIndex = existingUser.Collections.findIndex(
      (collectionItem) => collectionItem._id.toString() === cartid
    );
    if (cartIndex === -1) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item by itemid in the individualCarts array of the cart
    const itemIndex = existingUser.Collections[cartIndex].individualCarts.findIndex(
      (item) => item.itemId.toString() === itemid
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in the cart" });
    }

    // Remove the item from individualCarts array
    existingUser.Collections[cartIndex].individualCarts.splice(itemIndex, 1);

    // Save the updated user object
    await existingUser.save();

    // Respond with success message
    res.status(200).json({
      message: "Item deleted from cart successfully",
      cart: existingUser.Collections[cartIndex],
    });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


//for Collaborating add users to the account
Router.post("/addUsers/:existingUserId/:cartId", async (req, res) => {
  const { existingUserId, cartId } = req.params;
  const { email } = req.body;

  try {
    // Find existing user by ID
    const existingUser = await User.findById(existingUserId);
    if (!existingUser) {
      return res.status(404).json({ message: "Existing user not found" });
    }

    // Find friend user by email
    
    const friendUser = await User.findOne({ email });
    if (!friendUser) {
      return res.status(404).json({ message: "Friend user not found" });
    }
    if (!existingUser.associatedUsers.includes(friendUser._id)) {
      existingUser.associatedUsers.push(friendUser._id);
      await existingUser.save();
    }
    if (!friendUser.associatedUsers.includes(existingUser._id)) {
      friendUser.associatedUsers.push(existingUser._id);
      await friendUser.save();
    }
    // Find the specific cart by cartId in existingUser's collections
    const cartToUpdate = existingUser.Collections.find(
      (cart) => cart._id.toString() === cartId
    );
    if (!cartToUpdate) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if friendUser._id is already in the sharedWith array
    if (
      cartToUpdate.sharedWith.find(
        (userId) => userId.toString() === friendUser._id.toString()
      )
    ) {
      return res
        .status(400)
        .json({ message: "User already shared with this cart" });
    }

    // Update sharedWith array in the cart
    cartToUpdate.sharedWith.push(friendUser._id);
    await existingUser.save();

    res.status(200).json({
      message: "User and cart associated successfully",
      associatedUsers: existingUser.associatedUsers,
    });
  } catch (error) {
    console.error("Error adding associated user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//deleting any user from the wishlist

Router.delete("/deleteUserFromCart/:existingUserId/:cartId/:userIdToDelete", async (req, res) => {
  const { existingUserId, cartId, userIdToDelete } = req.params;

  // Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(existingUserId) ||
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(userIdToDelete)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    // Find existing user by ID
    const existingUser = await User.findById(existingUserId);
    if (!existingUser) {
      return res.status(404).json({ message: "Existing user not found" });
    }

    // Find the specific cart by cartId in existingUser's collections
    const cartToUpdate = existingUser.Collections.find(
      (cart) => cart._id.toString() === cartId
    );
    if (!cartToUpdate) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove userIdToDelete from sharedWith array in the cart
    const initialLength = cartToUpdate.sharedWith.length;
    cartToUpdate.sharedWith = cartToUpdate.sharedWith.filter(
      (userId) => userId.toString() !== userIdToDelete
    );

    // Check if any user was actually removed
    if (cartToUpdate.sharedWith.length === initialLength) {
      return res.status(404).json({ message: "User to delete not found in cart" });
    }

    // Save the updated user document
    await existingUser.save();

    res.status(200).json({
      message: "User removed from cart successfully",
      updatedCart: cartToUpdate,
    });
  } catch (error) {
    console.error("Error deleting user from cart:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

//for watching wishlist
Router.post("/watchWishlist/:existingUserId/:friendId", async (req, res) => {
  const { existingUserId, friendId } = req.params;

  try {
    const existingUser = await User.findById(existingUserId);
    const friendUser = await User.findById(friendId);

    if (!existingUser || !friendUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if friendUser._id is in existingUser.associatedUsers
    const isAssociated = existingUser.associatedUsers.some(
      (userId) => userId.toString() === friendUser._id.toString()
    );

    if (!isAssociated) {
      return res
        .status(403)
        .json({ message: "Friend user not in associated users list" });
    }

    // Check if friend user has any collections (carts)


    // Find the shared cart in friend user's collections
    const sharedCart = friendUser.Collections.find((cart) =>
      cart.sharedWith.some(
        (userId) => userId.toString() === existingUser._id.toString()
      )
    );
console.log(sharedCart);
    if (sharedCart) {
      return res.status(200).json({ message: "Cart found", cart: sharedCart });
    } else {
      return res
        .status(404)
        .json({ message: "Shared cart not found for friend user" });
    }
  } catch (error) {
    console.error("Error watching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
Router.get('/cart/:cartId', async (req, res) => {
  const { cartId } = req.params;

  try {
    // Find user by cart ID and project the matched cart
    const user = await User.findOne({ 'Collections._id': cartId }, { 'Collections.$': 1 }).populate({
      path: 'Collections.individualCarts.itemId',
      select: 'title content price picture'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found or cart not found for the user' });
    }

    // Ensure there is a cart found for the user
    const cart = user.Collections && user.Collections.length > 0 ? user.Collections[0] : null;

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user' });
    }

    // Extract individual items from individualCarts
    const itemsInCart = cart.individualCarts.map(item => ({
      itemId: item.itemId._id,
      title: item.itemId.title,
      content: item.itemId.content,
      price: item.itemId.price,
      picture: item.itemId.picture
    }));

    res.status(200).json({ message: 'Cart found', cart: itemsInCart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//remove item from cart 
Router.delete('/removeItemFromCart/:userId/:cartId/:itemId', async (req, res) => {
  const { userId, cartId, itemId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the specific cart in the user's Collections
    const cart = user.Collections.id(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart's individualCarts array
    const itemIndex = cart.individualCarts.findIndex(cartItem => cartItem.itemId.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item from the cart
    cart.individualCarts.splice(itemIndex, 1);

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "Item removed from cart successfully", cart });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//view user's all carts
Router.get('/getAllCarts/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const carts = user.Collections.map(cart => ({
      cartId: cart._id,
      name: cart.name
    }));

    return res.status(200).json({ message: 'Carts retrieved successfully', carts });
  } catch (error) {
    console.error('Error fetching carts:', error);
    return res.status(500).json({ message: 'Error fetching carts', error });
  }
});


Router.get('/getAssociatedUsers/:userId/:cartId', async (req, res) => {
  try {
    const { userId, cartId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cart = user.Collections.id(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const sharedWithIds = cart.sharedWith;

    // Fetch user details for each ID in sharedWith
    const friends = await User.find({ _id: { $in: sharedWithIds } }).select('id name');
    const friendData = friends.map(friend => ({ id: friend._id, name: friend.name }));

    return res.json({ message: 'Cart sent successfully', friends: friendData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

Router.post('/addItemsToFriendsWishlist/:userId/:friendId/:cartId', async (req, res) => {
  const { userId, friendId, cartId } = req.params;
  const { itemId,quantity } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found' });
    }

    const cart = user.Collections.id(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const findFriendInCart = cart.sharedWith.findIndex(friend => friend._id.toString() === friendId);
    if (findFriendInCart === -1) {
      return res.status(404).json({ message: 'Friend not associated with the user' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    cart.items.push(item);
    await user.save();

    return res.status(200).json({ message: 'Item added successfully', cart: cart });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

Router.get('/cartsSharedWithUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if sharedCarts is defined and is an array
    if (!user.sharedCarts || !Array.isArray(user.sharedCarts)) {
      return res.status(200).json({ message: 'No shared carts found', carts: [] });
    }

    const sharedCarts = user.sharedCarts.map(cart => ({
      id: cart._id,
      name: cart.name,
      items: cart.items, // if needed
    }));
    
    return res.status(200).json({ carts: sharedCarts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

Router.get('/getFriendsId/:userId/:cartId', async (req, res) => {
  const { userId, cartId } = req.params;

  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Find the user who owns the cart with the given cartId and check if it's shared with the given userId
    const owner = await User.findOne({
      'Collections._id': cartId,
      'Collections.sharedWith': { $elemMatch: { _id: userId } }
    });

    if (!owner) {
      return res.status(404).json({ message: 'No user found with the specified cart shared with the given user' });
    }

    return res.status(200).json({ message: 'User found', friend: owner._id });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
Router.get('/myAllWishlists/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.Collections || !Array.isArray(user.Collections)) {
      return res.status(200).json({ message: 'No collections found', data: [] });
    }

    const data = user.Collections.map(element => ({
      id: element._id,
      name: element.name
    }));

    return res.status(200).json({ message: 'Data sent', data: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
module.exports = Router;
