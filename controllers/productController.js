const mongoose = require('mongoose')
const Product = require('../models/Product');

exports.createProduct = async(req, res) => {
    try {
        if (!req.body.name)  {
            return res.status(400).json({error: 'bad request'})
        }

        const newProduct = await Product.create(req.body)
        return res.status(201).json(newProduct)
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}