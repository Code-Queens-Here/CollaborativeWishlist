const Express = require('express');
const mongoose = require('mongoose');
const Router = Express.Router();
const Item = require('../models/itemModel');

Router.post('/postItem', async (req, res) => {
    try {
        const { title, content, price, picture } = req.body;
        const existing = await Item.findOne({ title });
        
        if (existing) {
            return res.status(200).json({ message: 'Item already exists' });
        }
        
        const newItem = new Item({ title, content, price, picture });
        await newItem.save();
        return res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

Router.get('/getItem', async (req, res) => {
    try {
        const title = req.body.title;
        const existing = await Item.findOne({ title });
        
        if (existing) {
            return res.status(200).json({ item: existing });
        }
        
        return res.status(404).json({ message: 'Item does not exist' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

Router.delete('/deleteItem', async (req, res) => {
    try {
        const title = req.body.title;
        const existing = await Item.findOne({ title });
        
        if (existing) {
            await Item.deleteOne({ title: title });
            return res.status(200).json({ message: 'Successfully deleted' });
        }
        
        return res.status(404).json({ message: 'Item does not exist' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = Router;
