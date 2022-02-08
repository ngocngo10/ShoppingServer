const express = require('express');
const req = require('express/lib/request');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const route = express.Router();
const middlewares = require('../middlewares/auth.middleware');
const jwt = require("jsonwebtoken");
// const Auth = require('../models/auth.model');
const { generateToken } = require('../utils/generateToken');
require('dotenv').config();
// ma hoa mat khau
const bcrypt = require('bcryptjs');
const { token } = require('morgan');
let tokens = [];

route.post('/api/auth/signup', async function (req, res, next) {
  const salt = bcrypt.genSaltSync(10);
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password: bcrypt.hashSync(password, salt),
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
})

// route.post('/api/auth/refreshToken', (req, res) => {
//   //kiem tra client gui refreshToken gui len co hop le hay khong
//   const refreshToken = req.body.token;
//   if (!refreshToken) {
//     return res.status(401).json({ message: "Not seen refreshToken!" }); // dang nhap het han
//   }
//   console.log(refreshTokens);
//   if (!refreshTokens.includes(refreshToken)) {
//     return res.status(403).json({ message: "Please login again!" }); // k co quyen
//   }
//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.status(403).json(err);
//     }
//     const accessToken = jwt.sign(
//       {
//         username: data.userName
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       {
//         expiresIn: '3600s',
//       }
//     );
//     return res.json({ accessToken });
//   })

// })

// ---------them middle xu li testcase login
route.post('/api/auth/login', async function (req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: 'Please enter password or email ' });
    }
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const camparetion = bcrypt.compareSync(req.body.password, user.password);
    if (!camparetion) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isLock) {
      return res.status(401).json({ message: "Account has been locked" });
    }
   
    

    // var result = await Auth.create(auth);
    // console.log("Author: " + result);
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });

    // const refreshToken = jwt.sign({
    //   id: user._id,
    //   isAdmin: user.isAdmin,
    //   userName: user.userName,
    //   fullName: user.firstName + user.lastName
    // }, process.env.REFRESH_TOKEN_SECRET);
    /*
    tokens.push(accesstoken);
    console.log('TokesArray: ' + tokens);
    */

  } catch (error) {
    console.log(error);
    next(error);
  }


});

route.get('/api/auth/logout', middlewares.verifyToken, async function (req, res, next) {
  const accesstoken = req.headers.authorization;
  try {
    var result = await Auth.remove({ token: accesstoken });
    console.log(result);
    return res.status(200).send("logout");
  } catch (error) {
    next(error);
  }


})



module.exports = route;
