const express = require("express");
const mongoose = require("mongoose");
const Router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authenticateToken = require("../controller/authController");
const Item = require("../models/itemModel");
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

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

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      role,
      cart,
    });

    const payload = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });

    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", token, user: newUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//login by user
Router.post("/login", async (req, res) => {
  const { email, password, token } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

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
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


//get user info
Router.get("/getUser/:userId", async (req, res) => {
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
Router.put("/updateDetails", async (req, res) => {
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
Router.delete("/deleteUser", async (req, res) => {
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
  const { id } = req.params;
  const existingUser = await User.findById(id);
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
    cartToUpdate.sharedWith = cartToUpdate.sharedWith.filter(
      (userId) => userId.toString() !== userIdToDelete
    );

    // Save the updated user document
    await existingUser.save();

    res.status(200).json({
      message: "User removed from cart successfully",
      updatedCart: cartToUpdate,
    });
  } catch (error) {
    console.error("Error deleting user from cart:", error);
    res.status(500).json({ message: "Internal server error" });
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

module.exports = Router;
