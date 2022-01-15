const User = require('../models/user');
var jwt = require('jsonwebtoken');
const Auth = require('../models/auth.model');
const { findOne } = require('../models/auth.model');
const e = require('express');

async function checkUserExist(req, res, next) {
  try {
    let result = await User.findOne({ userName: req.body.userName }).exec();
    if (result) {
      return res.status(400).json({ message: "UserName already existed!!!" });
    }

    result = await User.findOne({ email: req.body.email }).exec();
    if (result) {
      return res.status(400).json({ message: "Email already existed!!!" });
    }
    result = await User.findOne({ phoneNumber: req.body.phoneNumber }).exec();
    if (result) {
      return res.status(400).json({ message: "PhoneNumber already existed!!!" });
    }
    next();

  } catch (error) {
    next(error);
  }

}

async function verifyToken(req, res, next) {
  var token = req.headers.authorization;
  //token ko co
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorization!!" });
  // }
  // //token bi sai or het han
  // try {
  //   //so sanh token gui len 
  //   var decoded = jwt.verify(token, 'shhhhh');
  //   console.log(decoded);
  // } catch (err) {
  //   console.log(err);
  //   if (err.message == 'jwt expired') {
  //     return res.status(401).json({message: 'Please login again!'})
  //   }
  //   return res.status(401).json({ message: "Unauthorization!!" });
  // }
  try {
    var auth = await Auth.findOne({ token: token }).exec();
    if (!auth) {
      return res.status(401).json({ message: 'Unauthorization!!' });
    }
    console.log(auth);
  } catch (error) {
    next(error);
  }

  next();
}

async function isLogin(req, res, next) {
  try {
    var user = await User.findOne({ userName: req.body.userName });
    var auth = await Auth.findOne({ user: user._id });
    if (!auth) {
      next();
    } else {
      return res.status(403).json({ message: "Permission is denied!" });
    }
  } catch (error) {
    next(error);
  }

}


module.exports = { checkUserExist, verifyToken, isLogin };
