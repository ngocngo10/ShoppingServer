const User = require('../models/user.model');
var jwt = require('jsonwebtoken');
// const Auth = require('../models/auth.model');
// const { findOne } = require('../models/auth.model');
const e = require('express');

async function checkUserExist(req, res, next) {
  try {
    /*
    let result = await User.findOne({ userName: req.body.userName }).exec();
    if (result) {
      return res.status(400).json({ message: "UserName already existed!!!" });
    }
    */

    let result = await User.findOne({ email: req.body.email }).exec();
    if (result) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // result = await User.findOne({ phoneNumber: req.body.phoneNumber }).exec();
    // if (result) {
    //   return res.status(400).json({ message: "PhoneNumber already existed!!!" });
    // }
    next();

  } catch (error) {
    next(error);
  }

}
/*
 async function checkConfirmPass(req, res, next){
   try {
    if (!(req.body.password === req.body.confirmPassword)) {
      return res.json({ message: 'Confirm Password was incorred' });
    }
    next();
     
   } catch (error) {
    next(error);
   }
 }

 */

async function verifyToken(req, res, next) {
  var token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        res.status(401).json({message: 'Not authorized, no token'});
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({message: 'Not authorized, token failed'});
    }
  }

 
}

async function isLogin(req, res, next) {
  try {
    var user = await User.findOne({ email: req.body.email });
    var auth = await Auth.findOne({ user: user._id });
    if (!auth) {
      next();
    } else {
      return res.status(403).json({ message: "You have already signin!" });
    }
  } catch (error) {
    next(error);
  }

}

async function checkIsLock(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: 'Please enter password or email ' });
    }
    const user = await User.findOne({ email: email });
    if (!user.isLock) {
      next();
    } else {
      return res.status(401).json({ message: "Account has been locked" });
    }
  } catch (error) {
    next(error);
  }

}


async function checkIsAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }

}




module.exports = { checkUserExist, verifyToken, isLogin, checkIsAdmin, checkIsLock };
