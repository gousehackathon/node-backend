const mongoose = require('mongoose')
const Auth = require('../models/Auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Helper function to create tokens
const createAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  };
  
  const createRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  };
  

exports.loginUser = async(req, res) => {
    console.log(req.body);
    const { email: identifier, password } = req.body;
    console.log(identifier);
    try {
        const existingUser = await Auth.findOne({ $or: [{mobileNumber : identifier}, {email: identifier}] });
 
        console.log(existingUser);
        if (!existingUser) {
        return res.status(400).json({ message: 'Invalid credentials 1' });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { userId: existingUser._id, name: existingUser.name };
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '10m' });

        const accessToken = createAccessToken(existingUser);
        const refreshToken = createRefreshToken(existingUser);
        existingUser.refreshToken = refreshToken;
        await existingUser.save();
        res.status(200).json({ token: accessToken, refresh: refreshToken,  userId: existingUser._id});
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

exports.createUser = async(req, res) => {
    const { name, mobileNumber, email, password } = req.body;
    try {
        if (!req.body.name || !req.body.mobileNumber || !req.body.email)  {
            return res.status(400).json({error: 'bad request'})
        }

        // Check for existing user by username or email
        console.log(mobileNumber);
        console.log(email);
        const existingUser = await Auth.findOne({ $or: [{mobileNumber: mobileNumber}, {email:email}] });
        console.log(existingUser);
        if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
        }

        const createUser = await Auth.create(req.body)
        console.log(createUser);
        return res.status(201).json(createUser)
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}


exports.refreshToken = async(req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(403).json({ message: 'Access denied, token missing!' });
    }
    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await Auth.findById(payload.userId);
        if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid token!' });
        }
        const newAccessToken = createAccessToken(user);
        const newRefreshToken = createRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        return res.status(500).json({error: error.message})
    }
}

