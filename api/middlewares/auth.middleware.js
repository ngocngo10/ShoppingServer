const User = require('../models/user.model');
var jwt = require('jsonwebtoken');
const Auth = require('../models/auth.model');
const { findOne } = require('../models/auth.model');
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
      return res.status(400).json({ message: "Email already existed!!!" });
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
 async function checkConfirmPass(req, res, next){
   try {
    if (!(req.body.password === req.body.confirmPass)) {
      return res.json({ message: 'Confirm Password was incorred' });
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
  var auth;
  try {
    auth = await Auth.findOne({ token: token }).populate('user').exec();
    if (!auth) {
      return res.status(401).json({ message: 'You need sign in!!' });
    }
    req.userId = auth.user._id;
    next();
  } catch (error) {
    next(error);
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
    var user = await User.findOne({ email: req.body.email });
    if (!(user.isLock)) {
      next();
    } else {
      return res.json({ message: "Account has been locked" });
    }
  } catch (error) {
    next(error);
  }

}


async function checkIsAdmin(req, res, next) {
  var token = req.headers.authorization;
  try {
    var auth = await Auth.findOne({ token: token }).populate('user').exec();
    console.log(auth);
    if (!auth) {
      return res.status(401).json({ message: 'You need sign in!!' });
    }
    if (!auth.user.isAdmin) {
      return res.status(403).json({ message: "Permission is denied!,You aren't admin!" });
    } 
    next();
  } catch (error) {
    next(error);
  }

}




module.exports = { checkUserExist, verifyToken, isLogin, checkIsAdmin, checkConfirmPass ,checkIsLock};
