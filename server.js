// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const itemRoutes=require('./routes/itemRoute')
const userRoutes=require('./routes/userRoute')




require('dotenv').config();

const app = express();
app.use(cors());
// Middleware
app.use(cors());    
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/item',itemRoutes);
app.use('/user',userRoutes);


// MongoDB connection and server start
const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to the database");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

start();
