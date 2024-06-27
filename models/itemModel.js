const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    price: {
        type: Number, // Assuming price is a numeric value
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
});

// Define or retrieve the 'Item' model
const Item = mongoose.model('Item', ItemSchema);
module.exports=Item;
