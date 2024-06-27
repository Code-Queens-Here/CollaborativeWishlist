const express=require('express')
const router=express.Router();
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv')
dotenv.config();
const jwtSecret=process.env.JWT_SECRET;

const authenticateToken=(req,res,next)=>{
    const token=req.headers['authorization']
    if(!token){
        return res.status(404).json({messgae:'Token needed'})
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });

}

module.exports=authenticateToken;